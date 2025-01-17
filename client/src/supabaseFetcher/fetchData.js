
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://bogosjbvzcfcldahqzqv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ29zamJ2emNmY2xkYWhxenF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTg2NjEsImV4cCI6MjA1MjQzNDY2MX0.UlaFnLDqXJgVF9tYCOL0c0hjCAd4__Yq47K5mVYdXcc';
const supabase = createClient(supabaseUrl, supabaseKey);


export const fetchJsonData = async (courseCode) => {
    try {
      // Fetch updated data from Supabase
      const { data, error } = await supabase
        .from('coursesessionplan') // Replace with your actual table name
        .select('Updated') // Replace with your actual column name
        .eq('Course Code', courseCode);

      // Handle errors or empty responses
      if (error || !data || data.length === 0 || !data[0].Updated) {
        throw new Error('Failed to fetch or no "Updated" data available in Supabase.');
      }

      const updatedData = data[0].Updated;

      // Check if the updated data is empty
      const isEmpty = Array.isArray(updatedData)
        ? updatedData.length === 0
        : Object.keys(updatedData).length === 0;

      if (isEmpty) {
        throw new Error('"Updated" data is empty.');
      }

      // console.log(updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error fetching "Updated" data:', error.message);

      try {
        // If there's an error or no updated data, fetch original data
        const { data: alphaData, error: alphaError } = await supabase
          .from('coursesessionplan') // Replace with your actual table name
          .select('Original') // Replace with your actual column name
          .eq('Course Code', courseCode);

        // Handle errors or empty responses
        if (alphaError || !alphaData || alphaData.length === 0 || !alphaData[0].Original) {
          throw new Error('Failed to fetch "Original" data from Supabase.');
        }

        // console.log(alphaData[0].Original);
        return alphaData[0].Original;
      } catch (alphaFetchError) {
        console.error('Error fetching "Original" data:', alphaFetchError.message);
        throw new Error('Unable to fetch any data from Supabase.');
      }
    }
  };

export const fetchSessionDates = async () => {
    try {
        // Fetch start date from Supabase
        const { data: startDateData, error: startDateError } = await supabase
            .from('holidaytable')
            .select('date')
            .eq('name', 'Start Session for SE/TE/BE')
            .single();

        if (startDateError) {
            console.error("Error Fetching Start Date", startDateError.message);
            throw new Error("Error fetching start date");
        }

        // Fetch end date from Supabase
        const { data: endDateData, error: endDateError } = await supabase
            .from('holidaytable')
            .select('date')
            .eq('name', 'End Session for SE/TE/BE')
            .single();

        if (endDateError) {
            console.error("Error Fetching End Date", endDateError.message);
            throw new Error("Error fetching end date");
        }

        // Return formatted dates
        return {
            startDate: startDateData.date.split('T')[0], // Convert to YYYY-MM-DD
            endDate: endDateData.date.split('T')[0],     // Convert to YYYY-MM-DD
        };
    } catch (err) {
        console.error("Unexpected error:", err);
        throw new Error("Unexpected error occurred");
    }
};


export const filterWorkingDays = async (dates) => {
    // Input validation
    if (!dates || !Array.isArray(dates)) {
        throw new Error('Invalid dates array');
    }
    // console.log(dates)
    const dateStrings = dates.map(item => item.date);
    
    // console.log('Extracted dates:', dateStrings); // Debug log

    const isValidDateFormat = (dateStr) => {
        if (typeof dateStr !== 'string') {
            console.error(`Invalid type for date: ${typeof dateStr}`);
            return false;
        }

        // Check for YYYY-MM-DD format using regex
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoDateRegex.test(dateStr)) {
            console.error(`Date doesn't match YYYY-MM-DD format: ${dateStr}`);
            return false;
        }

        // Validate the actual date values
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        return date && 
            date.getFullYear() === year && 
            date.getMonth() === month - 1 && 
            date.getDate() === day;
    };

    // Validate all dates
    const invalidDates = dateStrings.filter(date => !isValidDateFormat(date));
    if (invalidDates.length > 0) {
        console.error('Invalid dates found:', invalidDates);
        throw new Error(`Invalid date formats found. Dates must be in YYYY-MM-DD format. Invalid dates: ${invalidDates.join(', ')}`);
    }

    try {
        // Fetch holidays from Supabase
        const { data: events, error } = await supabase
            .from('holidaytable')
            .select('date, holiday')
            .in('date', dateStrings)
            .eq('holiday', 1);

        if (error) {
            console.error('Supabase error:', error);
            throw new Error('Error fetching holidays and events');
        }

        // Create a Set of holiday dates for faster lookup
        const holidaySet = new Set(events?.map(event => event.date) || []);

        // Filter out weekends and holidays
        const workingDays = dates.filter(dateObj => {
            const dateStr = dateObj.date;
            const dateInstance = new Date(dateStr + 'T00:00:00');
            const dayOfWeek = dateInstance.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = holidaySet.has(dateStr);
            
            return !isWeekend && !isHoliday;
        });

        // console.log('Filtered working days:', workingDays); // Debug log
        return workingDays; // Returns array of objects with date and dayOfWeek

    } 
     catch (err) {
        console.error('Error in filterWorkingDays:', err);
        throw new Error(`Error filtering working days: ${err.message}`);
    }
};



export const getEventData = async () => {
  try {
    // Fetch data from the holidaytable
    const { data: events, error } = await supabase
      .from('holidaytable')
      .select('name, date, holiday, institute_level, department_level');

    if (error) {
      return { error: 'Query failed: ' + error.message };
    }

    if (!events || events.length === 0) {
      return { error: 'No events found' };
    }

    // Process data into categorized lists
    const holidays = [];
    const instituteLevelEvents = [];
    const departmentEvents = [];

    events.forEach(event => {
      if (event.holiday) {
        holidays.push(event.date);
      }
      if (event.institute_level) {
        const currentDate = new Date(event.date);
        currentDate.setDate(currentDate.getDate() + 1);
        const date = currentDate.toISOString().split('T')[0];
        instituteLevelEvents.push(date);
      }
      if (event.department_level) {
        const currentDate = new Date(event.date);
        currentDate.setDate(currentDate.getDate() + 1);
        const date = currentDate.toISOString().split('T')[0];
        departmentEvents.push(date);
      }
    });

    // Return the processed data as a JSON object
    return {
      events,
      holidays,
      instituteLevelEvents,
      departmentEvents
    };
  } catch (error) {
    return { error: error.message };
  }
};
