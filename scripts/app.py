import pandas as pd
import re
import json

def extract_subtopics(content):
    subtopics = re.split(r'[.;]\s*', content)
    return [subtopic.strip() for subtopic in subtopics if subtopic.strip()]

def distribute_content(subtopics, total_hours):
    distributed_content = []
    subtopic_index = 0
    for hour in range(1, total_hours + 1):
        if subtopic_index < len(subtopics):
            content = subtopics[subtopic_index]
            subtopic_index += 1
            
            # Check if we can combine with the next subtopic
            if subtopic_index < len(subtopics) and len(content.split()) + len(subtopics[subtopic_index].split()) <= 15:
                content += "; " + subtopics[subtopic_index]
                subtopic_index += 1
        else:
            content = "Review and practice"
        
        distributed_content.append(f"Hour {hour}: {content}")
    
    return distributed_content

# Load the Excel file
excel_file = 'Syllabus.xlsx'
sheet_name = 'SEMIV'  # Specify the sheet name here

print(f"Reading data from '{excel_file}', sheet: '{sheet_name}'")
syllabus_df = pd.read_excel(excel_file, sheet_name=sheet_name)

# Process the data
output_data = []

for _, row in syllabus_df.iterrows():
    course_name = row['Course Name']
    module_name = row['Module Name']
    total_hours = int(row['Hours'])
    subtopics = extract_subtopics(row['Detailed Content'])
    
    distributed_content = distribute_content(subtopics, total_hours)
    
    for content in distributed_content:
        output_data.append({
            "Course Name": course_name,
            "Module": module_name,
            "Divided Content": content
        })

# Convert to JSON
json_data = json.dumps(output_data, indent=2)

# Print a sample of the JSON data
print("\nSample of JSON data:")
print(json.dumps(output_data[:5], indent=2))

# Save the full JSON to a file
output_file = 'syllabus_data.json'
with open(output_file, 'w') as f:
    f.write(json_data)

print(f"\nFull JSON data has been saved to '{output_file}'")