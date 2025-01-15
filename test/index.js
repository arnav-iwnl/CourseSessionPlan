// Import the Supabase client
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = 'https://bogosjbvzcfcldahqzqv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ29zamJ2emNmY2xkYWhxenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTg2NjEsImV4cCI6MjA1MjQzNDY2MX0.UlaFnLDqXJgVF9tYCOL0c0hjCAd4__Yq47K5mVYdXcc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define a function to upload the JSON data
async function uploadSessionPlans() {
  try {

    const { data : currentIndexArray, error:get_max_error } = await supabase.rpc('get_max_index');

    if (get_max_error) {
      console.error('Error executing RPC:', error);
      return;
    }
    const currentIndex = currentIndexArray[0].current_index;

    // Step 1: Retrieve the file from the bucket
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('Course Session Bucket')
      .download('CE/SEM8_CE.json'); // Corrected path

    if (fileError) {
      console.error('Error fetching file:', fileError);
      return;
    }

    // Step 2: Parse the JSON data
    const fileText = await fileData.text();
    const jsonData = JSON.parse(fileText);

    // Step 3: Prepare and push data into the `CourseSessionPlan` table
    const rows = Object.entries(jsonData).map(([courseCode, courseData], idx) => ({
      index: currentIndex + idx + 1, // Auto-incrementing index value
      "Course Code": courseCode, // Matches database column
      Original: courseData // Matches database column
    }));

 
    // Step 4: Insert rows into the database
    const { data: insertData, error: insertError } = await supabase
      .from('coursesessionplan')
      .insert(rows);

    if (insertError) {
      console.error('Error inserting data:', insertError);
    } else {
      console.log('Data inserted successfully:', insertData);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

const subjetCode = "ECC401";

const fetchJsonData = async () => {
        try {
          // Fetch updated data from Supabase (assuming it's a column in your table)
          const { data, error } = await supabase
            .from('coursesessionplan') // Replace 'your_table' with your actual table name
            .select('Updated') // Replace 'updated_data' with your actual column name
            .eq("Course Code", subjetCode);
      
          if (error || data[0].Updated==null) {
            throw new Error('Failed to fetch updated_data from Supabase');
          }
      
          const updatedData = data;
      
          // Check if the updatedData is empty
          const isEmpty = Object.values(updatedData).every(
            value => Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0
          );
      
          if (isEmpty) {
            throw new Error('updated_data is empty');
          }
      
          return updatedData;
      
        } catch (error) {
          // If there's an error or no updated data, fetch alpha data
          const { data: alphaData, error: alphaError } = await supabase
          .from('coursesessionplan') // Replace 'your_table' with your actual table name
          .select('Original') // Replace 'updated_data' with your actual column name
          .eq("Course Code", subjetCode);
      
          if (alphaError) {
            throw new Error('Failed to fetch alpha_data from Supabase');
          }
      
          return alphaData;
        }
        
      };
// Call the function
// uploadSessionPlans();
const jsonData = await fetchJsonData();
console.log(jsonData);
