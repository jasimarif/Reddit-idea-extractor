const { OpenAI } = require('openai');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get API key from command line or environment variable
const apiKey = process.argv[2] || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Please provide your OpenAI API key as an argument or set OPENAI_API_KEY environment variable');
  console.error('Usage: node delete-assistants.js YOUR_OPENAI_API_KEY');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

async function deleteAllAssistants() {
  try {
    console.log('Fetching all assistants...');
    const assistants = await openai.beta.assistants.list();
    
    if (assistants.data.length === 0) {
      console.log('No assistants found.');
      return;
    }

    console.log(`Found ${assistants.data.length} assistant(s):`);
    assistants.data.forEach((assistant, index) => {
      console.log(`${index + 1}. ${assistant.name || 'Unnamed'} (${assistant.id})`);
    });

    readline.question(`\nAre you sure you want to delete all ${assistants.data.length} assistants? (yes/no) `, async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('Deleting assistants...');
        let deletedCount = 0;
        
        for (const assistant of assistants.data) {
          try {
            await openai.beta.assistants.delete(assistant.id);
            console.log(`Deleted assistant: ${assistant.name || 'Unnamed'} (${assistant.id})`);
            deletedCount++;
          } catch (error) {
            console.error(`Error deleting assistant ${assistant.id}:`, error.message);
          }
        }
        
        console.log(`\nSuccessfully deleted ${deletedCount} out of ${assistants.data.length} assistants.`);
      } else {
        console.log('Operation cancelled.');
      }
      readline.close();
    });
  } catch (error) {
    console.error('An error occurred:', error.message);
    readline.close();
  }
}

deleteAllAssistants();
