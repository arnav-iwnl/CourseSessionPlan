export const formatDate = (inputDate) => {
    // Split the string into an array [year, month, day]
    const [year, month, day] = inputDate.split('-');
  
    // Return the formatted date in "DD/MM/YYYY" format
    return `${day}/${month}/${year}`;
  }