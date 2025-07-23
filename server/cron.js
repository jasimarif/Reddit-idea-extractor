const cron = require("node-cron");
const ideaService = require("./services/idea.service");
const painpointService = require("./services/painpoint.service");
const marketGapService = require("./services/marketGap.service");

const startCronJobs = () => {
  console.log("Starting cron jobs...");

  const {
    fetchTopPosts,
    fetchComments,
    storeThread,
  } = require("./services/reddit.service");
  const Thread = require("./models/Threads");

  cron.schedule(
    "55 18 * * *",
    async () => {
      console.log("Running daily Reddit idea fetch...");
      const subredditList = [
        "startups",
        "Entrepreneur",
        "smallbusiness",
        "freelance",
        "consulting",
        "overemployed",
        "jobs",
        "resumes",
        "careerguidance",
        "Health",
        "mentalhealth",
        "Anxiety",
        "depression",
        "Fitness",
        "loseit",
        "ADHD",
        "StopSmoking",
        "eczema",
        "personalfinance",
        "relationships",
        "relationship_advice",
        "parenting",
        "custody",
        "coparenting",
        "divorce",
        "blendedfamilies",
        "breakups",
        "productivity",
        "digitalnomad",
        "indiebiz",
        "SaaS",
        "solopreneurs",
        "WorkReform",
        "financialindependence",
        "sideproject",
        "makers",
        "nocode",
      ];

      const threadIds = [];
      let savedThreads = 0;

      try {
        for (const subreddit of subredditList) {
          console.log(`\n=== Fetching from r/${subreddit} ===`);
          try {
            const posts = await fetchTopPosts(subreddit, 3);
            console.log(`Found ${posts.length} posts in r/${subreddit}`);

            for (const post of posts) {
              try {
                console.log(
                  `\nProcessing post: ${post.title.substring(0, 50)}...`
                );

                console.log("Fetching comments...");
                const comments = await fetchComments(post.id);
                console.log(`Found ${comments.length} relevant comments`);

                console.log("Saving thread to database...");
                const savedThread = await storeThread(
                  { ...post, subreddit },
                  comments
                );

                if (savedThread && savedThread._id) {
                  threadIds.push(savedThread._id.toString());
                  savedThreads++;
                  console.log(`Successfully saved thread ${savedThread._id}`);
                } else {
                  console.log("Thread was not saved (may be a duplicate)");
                }

                await new Promise((resolve) => setTimeout(resolve, 2000));
              } catch (postError) {
                console.error(
                  `Error processing post ${post.id}:`,
                  postError.message
                );
                continue;
              }
            }

            console.log(
              `Finished processing r/${subreddit}. Waiting before next subreddit...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } catch (subredditError) {
            console.error(
              `Error processing subreddit r/${subreddit}:`,
              subredditError.message
            );
            continue;
          }
        }

        console.log(`\n=== Thread Fetching Complete ===`);
        console.log(
          `Total threads processed: ${savedThreads} new, ${
            threadIds.length - savedThreads
          } existing`
        );

        if (threadIds.length > 0) {
          console.log("\n=== Starting Pain Point Analysis ===");
          console.log(
            `Analyzing ${threadIds.length} threads for pain points...`
          );

          const results = [];
          let processedCount = 0;

          for (const threadId of threadIds) {
            processedCount++;
            console.log(
              `\n[${processedCount}/${threadIds.length}] Processing thread ${threadId}`
            );

            try {
              const thread = await Thread.findById(threadId);
              if (!thread) {
                console.log(` Thread ${threadId} not found in database`);
                results.push({
                  threadId,
                  status: "error",
                  error: "Thread not found",
                });
                continue;
              }

              if (thread.painPointsExtracted) {
                console.log(" Thread already processed, skipping...");
                results.push({
                  threadId,
                  status: "skipped",
                  reason: "Already processed",
                });
                continue;
              }

              console.log(
                `Extracting pain points from: ${thread.title.substring(
                  0,
                  50
                )}...`
              );

              try {
                const extracted =
                  await painpointService.extractPainPointsFromThread(thread);
                console.log(
                  `Extracted ${extracted.length} potential pain points`
                );

                if (extracted.length > 0) {
                  console.log("Saving pain points to database...");
                  const saved = await painpointService.savePainPoints(
                    extracted,
                    thread
                  );
                  console.log(`Successfully saved ${saved.length} pain points`);

                  // === Generate business ideas for these pain points ===
                  if (saved.length > 0) {
                    try {
                      const ideas =
                        await marketGapService.generateBusinessIdeas(saved);
                      console.log(
                        `Generated and saved ${ideas.length} business ideas for thread ${threadId}`
                      );
                    } catch (ideaError) {
                      console.error(
                        "Error generating business ideas:",
                        ideaError
                      );
                    }
                  }
                  thread.painPointsExtracted = true;
                  thread.isProcessed = true;
                  await thread.save();

                  results.push({
                    threadId,
                    status: "success",
                    painPoints: saved,
                    title: thread.title,
                  });
                } else {
                  console.log("No pain points extracted from thread");
                  thread.isProcessed = true;
                  await thread.save();
                  results.push({
                    threadId,
                    status: "skipped",
                    reason: "No pain points extracted",
                    title: thread.title,
                  });
                }
              } catch (extractError) {
                console.error("Error extracting pain points:", extractError);
                results.push({
                  threadId,
                  status: "error",
                  error: extractError.message,
                  title: thread.title,
                });
              }
            } catch (threadError) {
              console.error(
                `Error processing thread ${threadId}:`,
                threadError
              );
              results.push({
                threadId,
                status: "error",
                error: threadError.message,
              });
            }

            if (processedCount < threadIds.length) {
              console.log("Waiting before next thread...");
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          }

          const successCount = results.filter(
            (r) => r.status === "success"
          ).length;
          const skippedCount = results.filter(
            (r) => r.status === "skipped"
          ).length;
          const errorCount = results.filter((r) => r.status === "error").length;

          console.log("\n=== Analysis Complete ===");
          console.log(`Success: ${successCount} threads`);
          console.log(`Skipped: ${skippedCount} threads`);
          console.log(`Errors: ${errorCount} threads`);

          if (errorCount > 0) {
            console.log("\n=== Error Details ===");
            results
              .filter((r) => r.status === "error")
              .forEach((r, i) => {
                console.log(`\n${i + 1}. Thread: ${r.title || "N/A"}`);
                console.log(`   ID: ${r.threadId}`);
                console.log(`   Error: ${r.error || "Unknown error"}`);
              });
          }
        } else {
          console.log("No new threads to analyze");
        }

        console.log(
          "Daily Reddit idea fetch and analysis completed successfully"
        );
      } catch (error) {
        console.error("Error in daily Reddit idea fetch:", error);
      }
    },
    {
      timezone: "Asia/Karachi",
    }
  );

  cron.schedule(
    "0 0 * * 0",
    async () => {
      console.log("Running weekly cleanup...");

      try {
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const Post = require("./models/PainPoint");

        const result = await Post.deleteMany({
          createdAt: { $lt: ninetyDaysAgo },
          isManuallyAdded: false,
        });

        console.log(`Cleaned up ${result.deletedCount} old posts`);
      } catch (error) {
        console.error("Error in weekly cleanup:", error);
      }
    },
    {
      timezone: "Asia/Karachi",
    }
  );

  console.log("Cron jobs scheduled successfully");
};

module.exports = { startCronJobs };
