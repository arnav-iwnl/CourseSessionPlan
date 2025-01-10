import pandas as pd
import re
import json

def extract_subtopics(content):
    """Split the content into subtopics without splitting by semicolons."""
    return [content.strip()] if content.strip() else []

def distribute_content(subtopics, total_hours):
    """Distribute subtopics across the available hours."""
    distributed_content = {}
    
    # Simply map each content to its corresponding hour
    for hour in range(1, total_hours + 1):
        if hour - 1 < len(subtopics):
            content = subtopics[hour - 1]
            distributed_content[f"Hour {hour}"] = content
    
    return distributed_content

def extract_hour_number(hour_string):
    """Extract the numeric part from the 'Hour' string (e.g., 'Hour 1' -> 1)."""
    match = re.search(r'\d+', hour_string)
    return int(match.group()) if match else 0

def create_json_structure(df):
    output = {}
    
    # First, group the data by Course Name and Module
    for course_name, course_group in df.groupby('Course Name'):
        output[course_name] = []
        
        for module_name, module_group in course_group.groupby('Module Name'):
            module_data = {
                "id": len(output[course_name]) + 1,
                "Module": module_name,
                "Divided Content": {}
            }
            
            # Sort the module group by Hours to maintain order
            module_group = module_group.sort_values('Hours')
            
            # Add each hour's content directly
            for _, row in module_group.iterrows():
                hour_num = extract_hour_number(row['Hours'])
                content = row['Divided Content']
                if pd.notna(content):  # Check if content is not NaN
                    module_data["Divided Content"][f"Number of Hours: {hour_num}"] = content.strip()
            
            output[course_name].append(module_data)
    
    return output

# Load the Excel file
file_path = 'output_file.xlsx'
data = pd.ExcelFile(file_path)
sheet_name = data.sheet_names[0]
df = data.parse(sheet_name)

# Create the JSON structure
json_data = create_json_structure(df)

# Write to a JSON file
output_path = 'converted_data.json'
with open(output_path, 'w') as json_file:
    json.dump(json_data, json_file, indent=4)

print(f"JSON data saved to {output_path}")
