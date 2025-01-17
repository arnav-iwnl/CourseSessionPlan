import pandas as pd
import json
import os

def excel_to_json_all_sheets(file_path, output_dir=""):
    # Create output directory if it doesn't exist
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Read all sheets from the Excel file
    excel_file = pd.ExcelFile(file_path)
    sheet_names = excel_file.sheet_names

    for sheet_name in sheet_names:
        # Read the current sheet
        sheet_data = pd.read_excel(file_path, sheet_name=sheet_name)

        # Initialize result dictionary
        result = {}

        # Group by Course Code to process modules for each course
        for course_code, course_group in sheet_data.groupby("Course Code"):
            # Get the course name (assuming it's same for all rows of same course)
            course_name = course_group["Course Name"].iloc[0]

            # Initialize the course entry with empty modules list
            if course_code not in result:
                result[course_code] = {
                    "Course Name": course_name,
                    "Modules": []
                }

            # Process each row as a module
            module_id = 1  # Initialize module ID counter for each course

            for _, row in course_group.iterrows():
                module_name = row["Module Name"]
                divided_content = row["Divided Content"]

                # Ensure Hours column is properly converted to an integer
                try:
                    total_hours = int(row["Hours"])
                except ValueError:
                    print(f"Sheet: {sheet_name} - Invalid Hours value for Course Code {course_code}. Skipping row.")
                    continue

                if total_hours <= 0:
                    print(f"Sheet: {sheet_name} - Invalid Total Hours ({total_hours}) for Course Code {course_code}. Skipping row.")
                    continue

                # Create hour distribution
                hour_distribution = {}
                for hour in range(1, total_hours + 1):
                    hour_distribution[f"Hour {hour}"] = {
                        "Content": divided_content if hour == 1 else "",
                        "Hour Number": hour
                    }

                # Create module object
                module = {
                    "id": module_id,
                    "Module Name": module_name,
                    "Total Hours": total_hours,
                    "Hour Distribution": hour_distribution
                }

                # Add module to the course's modules list
                result[course_code]["Modules"].append(module)
                module_id += 1

        # Convert to JSON
        json_result = json.dumps(result, indent=4)

        # Create output filename
        output_file = os.path.join(output_dir, f"{sheet_name}.json")

        # Save JSON to a file
        with open(output_file, "w") as json_file:
            json_file.write(json_result)

        print(f"Generated JSON file for sheet '{sheet_name}' - Saved as {output_file}")

# Example usage:
if __name__ == "__main__":
    # Specify the file path
    file_path = "PREFINAL_SYLLABUS.xlsx"  # Replace with your actual file path

    # Optionally specify an output directory (leave empty for current directory)
    output_dir = "./output"  # You can set this to something like "output" or "json_files"

    # Convert all sheets to JSON
    excel_to_json_all_sheets(file_path, output_dir)