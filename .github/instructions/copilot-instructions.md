max_output_tokens: 4096


## File Creation Policy

Do not generate or create summary, status, or temporary documentation files unless the user specifically asks for them.

- Do NOT create documentation files for completed tasks unless requested
- Do NOT create temporary status tracking files
- Only create code files or update existing documentation if the user requests it
- If a summary is needed, provide it in the chat response, not as a file

## Running anything in terminal / testing changes

- If you want to test something: run server in one terminal and commands that test in separate terminal.
- Before trying to run another server check if there is already one running. Don't spawn servers without checking first.

