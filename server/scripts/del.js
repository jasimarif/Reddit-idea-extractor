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

async function deleteAssistant() {
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


    readline.question('Enter the assistant ID to delete: ', async (assistantId) => {
      try {
        await openai.beta.assistants.delete(assistantId);
        console.log(`Deleted assistant with ID: ${assistantId}`);
      } catch (error) {
        console.error(`Error deleting assistant ${assistantId}:`, error.message);
      }
      readline.close();
    });

  }catch(error){
    console.error('An error occurred:', error.message);
    readline.close();
  }

}

deleteAssistant();
