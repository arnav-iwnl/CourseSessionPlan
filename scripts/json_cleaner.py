mport json

def clean_content(content):
    if not isinstance(content, str):
        return content
    # Clean up special characters and whitespace
    content = content.replace('\n', ' ').strip()
    content = ' '.join(content.split())
    return content

def convert_json_format(data):
    result = {}
    
    for item in data:
        course_name = clean_content(item['Course Name'])
        if course_name not in result:
            result[course_name] = []
            
        # Find existing module or create new one
        module_name = clean_content(item['Module'])
        module_entry = next(
            (m for m in result[course_name] if m['Module'] == module_name), 
            None
        )
        
        if module_entry is None:
            module_entry = {
                'id': len(result[course_name]) + 1,
                'Module': module_name,
                'Divided Content': {}
            }
            result[course_name].append(module_entry)
            
        # Extract hour number and content
        content = clean_content(item['Divided Content'])
        if 'Hour ' in item['Divided Content']:
            hour_num = item['Divided Content'].split('Hour ')[1].split(':')[0]
            module_entry['Divided Content'][f'Hour {hour_num}'] = content
            
    return result

def main():
    # Read input JSON
    with open('SEM4_syllabus_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Convert to new format
    converted_data = convert_json_format(data)
    
    # Write output JSON
    with open('SEM4_converted_syllabus.json', 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
