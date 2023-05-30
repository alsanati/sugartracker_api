# Supabase Function Documentation

This documentation provides an overview of the setup and dependencies of a Supabase function defined in a Deno script. The function serves as an HTTP server and handles requests to retrieve patient and glucose data from a Supabase database.

## Setup

To set up the project and run the Supabase function, follow these steps:

1. Make sure you have Deno installed on your system. If not, you can install Deno by following the instructions at [deno.land](https://deno.land).

2. Create a new directory for your project and navigate to it in your terminal.

3. Install the required dependencies by adding the following import statements at the beginning of your script:

   ```typescript
   import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
   import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';
   ```

4. Optionally, you can add Deno lint ignore comment at the beginning of your script to suppress any linting errors:

   ```typescript
   // deno-lint-ignore-file
   ```

5. Set up environment variables for your Supabase connection by assigning your Supabase URL and anonymous key to the `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables, respectively.

6. Run the Deno server by executing the following command in your terminal:

   ```bash
   deno run --allow-env --allow-net index.ts
   ```

   The `--allow-env` flag allows access to environment variables, and the `--allow-net` flag grants network access for serving HTTP requests.

7. Your Supabase function is now running, and you can start making requests to retrieve patient and glucose data.

## Dependencies

The Supabase function relies on the following dependencies:

- `deno.land/std@0.177.0/http/server.ts`: This is a standard Deno module used for serving HTTP requests.

- `esm.sh/@supabase/supabase-js@2.22.0`: This is the Supabase JavaScript client library used for interacting with the Supabase database.

These dependencies are imported using ES modules syntax directly from the respective URLs. When the Deno script is executed, Deno automatically fetches and caches these dependencies.

Make sure you have an internet connection when running the Supabase function for the first time to ensure the dependencies are fetched successfully.

You can find more information about these dependencies and their usage in the respective documentation:

- Deno Standard Modules: [deno.land/std](https://deno.land/std)
- Supabase JavaScript Client: [supabase.io/docs/guides/javascript](https://supabase.io/docs/guides/javascript)
