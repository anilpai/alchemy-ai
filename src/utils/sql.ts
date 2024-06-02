// This function checks if the provided SQL statement is a SELECT statement.
// It converts the statement to uppercase, trims any leading or trailing whitespace,
// and then checks if it starts with "SELECT".
export const checkStatementIsSelect = (statement: string) => {
  return statement.toUpperCase().trim().startsWith("SELECT");
};
