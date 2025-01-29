import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the model
const genAI = new GoogleGenerativeAI("AIzaSyCM8cUdeVj-fKL2kX3UKMwb7UX221nNvPc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define the prompt structure (general template for Gemini)

// Function to generate topic distribution for each lecture
export async function generateTopicForEachLecture(promptData) {
  const prompt = `
    Divide the chapter information into topics and allocate the total hours for teaching.

    The module information includes the following:
    ${promptData
      .map(
        (module) => `
        Module Name: ${module.moduleName}
        Total Hours: ${module.totalHours}
        Content: ${module.hour1Content}
        `,
      )
      .join("\n")}

    Distribute these topics logically across the total hours, grouping multiple topics within an hour if needed. Return the output in JSON format with each hour containing an array of topic strings under the "topics" key. Make sure all the inputed content is allocated into respective topics. Also make sure you dont return an empty array as topic and if you do then say "continued".The JSON should have the structure:

    {
      "Module Name": {
        "total_hours": [Total Hours],
        "topic_distribution": [
          {
            "hour": 1,
            "topics": ["Topic 1", "Topic 2"]
          },
          {
            "hour": 2,
            "topics": ["Topic 3"]
          },
          ...
        ]
      }
    }
    
    Ensure that the JSON is concise and formatted properly without any additional descriptions or explanations.
    Ensure that topics are not empty array and start with Capital letter.
    return json object only
  `;

  // Sending the prompt to Gemini for content generation
  try {
    const result = await model.generateContent(prompt);
    // console.log("result : ", result);
    // const jsonResponse = JSON.parse(result.response.text());
    //
    let jsonResponse = result.response.text();
    jsonResponse = jsonResponse.replaceAll("```json", "");
    jsonResponse = jsonResponse.replaceAll("```", "");
    // console.log("hello : ", jsonResponse);

    return jsonResponse;
    // return result.response.text();
  } catch (error) {
    toast.error(error.message || 'An error occurred');

    // console.error("Error generating content:", error);
  }
}

