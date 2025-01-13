# import pandas as pd
# import re
# import json

# def extract_subtopics(content):
#     """Split the content into subtopics without splitting by semicolons."""
#     return [content.strip()] if content.strip() else []

# def distribute_content(subtopics, total_hours):
#     """Distribute subtopics across the available hours."""
#     distributed_content = {}
    
#     # Simply map each content to its corresponding hour
#     for hour in range(1, total_hours + 1):
#         if hour - 1 < len(subtopics):
#             content = subtopics[hour - 1]
#             distributed_content[f"Hour {hour}"] = content
    
#     return distributed_content

# def extract_hour_number(hour_string):
#     """Extract the numeric part from the 'Hour' string (e.g., 'Hour 1' -> 1)."""
#     if isinstance(hour_string, int):
#         return hour_string  # If it's already an integer, return it directly.
#     elif isinstance(hour_string, str):
#         match = re.search(r'\d+', hour_string)
#         return int(match.group()) if match else 0
#     else:
#         raise ValueError("Input must be a string or an integer.")

# def create_json_structure(df):
#     output = {}
    
#     # First, group the data by Course Name and Module
#     for course_name, course_group in df.groupby('Course Name'):
#         output[course_name] = []
        
#         for module_name, module_group in course_group.groupby('Module Name'):
#             module_data = {
#                 "id": len(output[course_name]) + 1,
#                 "Module": module_name,
#                 "Divided Content": {}
#             }
            
#             # Iterate through module_group without sorting to maintain original order
#             for _, row in module_group.iterrows():
#                 hour_num = extract_hour_number(row['Hours'])
#                 content = row['Detailed Content']
#                 if pd.notna(content):  # Check if content is not NaN
#                     module_data["Divided Content"][f"Number of Hours: {hour_num}"] = content.strip()
            
#             output[course_name].append(module_data)
    
#     return output

# # Load the Excel file
# file_path = 'Syllabus IOT.xlsx'
# data = pd.ExcelFile(file_path)
# sheet_name = data.sheet_names[0]
# df = data.parse(sheet_name)

# # Create the JSON structure
# json_data = create_json_structure(df)

# # Write to a JSON file
# output_path = 'converted_data.json'
# with open(output_path, 'w') as json_file:
#     json.dump(json_data, json_file, indent=4)

# print(f"JSON data saved to {output_path}")


import pandas as pd
import json


def excel_to_course_json(excel_file, sheet_name):
    """
    Convert Excel sheet with course data to hierarchical JSON format.
    Creates hour entries for each detailed content item.
    
    Parameters:
    excel_file (str): Path to Excel file
    sheet_name (str): Name of the sheet to process
    
    Expected Excel columns:
    - Course Name
    - Module Name
    - Detailed Content
    - Hours
    """
    # Read Excel file with specified sheet
    df = pd.read_excel(excel_file, sheet_name=sheet_name)
    
    # Initialize result dictionary
    result = {}
    
    # Group by Course Name
    for course_name, course_group in df.groupby('Course Name'):
        course_modules = []
        
        # Group by Module within each course
        for module_id, (module_name, module_group) in enumerate(course_group.groupby('Module Name'), 1):
            module_data = {
                "id": module_id,
                "Module Name": module_name,
                "Detailed Content": []
            }
            
            # Process each unique detailed content entry
            detailed_contents = module_group['Detailed Content'].unique()
            for content in detailed_contents:
                # Initialize dictionary for this content
                content_dict = {}
                
                # Get number of hours for this content
                content_hours = int(module_group[module_group['Detailed Content'] == content]['Hours'].iloc[0])
                
                # Create array with hour entries
                hours_array = [
                    f"Hour {i+1} : {content}"
                    for i in range(content_hours)
                ]
                
                # Add to content dictionary
                content_dict[content] = hours_array
                
                # Add to module's detailed content
                module_data["Detailed Content"].append(content_dict)
            
            course_modules.append(module_data)
        
        result[course_name] = course_modules
    
    return result

def save_json(data, output_file):
    """Save the data to a JSON file with proper formatting"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Example usage
if __name__ == "__main__":
    # Replace with your Excel file path and sheet name
    excel_file = "ECS.xlsx"
    sheet_name = "SEM8"  # Replace with your sheet name
    output_file = sheet_name +" ECS.json"
    
    try:
        # Convert Excel to JSON
        json_data = excel_to_course_json(excel_file, sheet_name)
        
        # Save to file
        save_json(json_data, output_file)
        print(f"Successfully converted sheet '{sheet_name}' from {excel_file} to {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")