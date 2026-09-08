# Supabase database root CA

`supabase-root.crt` is the public Supabase Root 2021 certificate, not a private credential.

Downloaded from the URL used by Supabase Studio:
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

Source of the URL template:
https://github.com/supabase/supabase/blob/master/apps/studio/hooks/custom-content/custom-content.json

Used only by the migration script; hostname and certificate verification remain enabled.
