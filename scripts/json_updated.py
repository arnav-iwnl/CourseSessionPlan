import pandas as pd
import json

def excel_to_course_json(excel_file, sheet_name):
    """
    Convert Excel sheet with course data to hierarchical JSON format with hour distribution.
    Counts total hours per module and distributes detailed content across hours.

    Parameters:
    excel_file (str): Path to Excel file
    sheet_name (str): Name of the sheet to process
    """
    # Read Excel file
    df = pd.read_excel(excel_file, sheet_name=sheet_name)

    # Initialize result dictionary
    result = {}

    # Group by Course Name
    for course_name, course_group in df.groupby('Course Name'):
        course_modules = []

        # Group by Module within each course
        for module_id, (module_name, module_group) in enumerate(course_group.groupby('Module Name'), 1):
            # Calculate total hours for the module
            total_module_hours = module_group['Hours'].sum()

            module_data = {
                "id": module_id,
                "Module Name": module_name,
                "Total Hours": int(total_module_hours),
                "Hour Distribution": {}
            }

            # Track current hour
            current_hour = 1

            # Process each content entry and distribute across hours
            for _, row in module_group.iterrows():
                content = row['Divided Content']
                hours = int(row['Hours'])

                # Distribute this content across its allocated hours
                for hour_offset in range(hours):
                    hour_key = f"Hour {current_hour}"
                    module_data["Hour Distribution"][hour_key] = {
                        "Content": content,
                        "Hour Number": current_hour
                    }
                    current_hour += 1

            course_modules.append(module_data)

        result[course_name] = course_modules

    return result

def save_json(data, output_file):
    """Save the data to a JSON file with proper formatting"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Example usage
if __name__ == "__main__":
    excel_file = "Sem6_CE.xlsx"
    sheet_name = "Sem6"
    output_file = f"{sheet_name}_ECS_with_hours.json"

    try:
        # Convert Excel to JSON with hour distribution
        json_data = excel_to_course_json(excel_file, sheet_name)

        # Save to file
        save_json(json_data, output_file)
        print(f"Successfully converted sheet '{sheet_name}' from {excel_file} to {output_file}")

    except Exception as e:
        print(f"Error: {str(e)}")
