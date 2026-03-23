// api/addPet.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bbkzmqupvtvhqcjaxmcw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { name, price, imageBase64, fileName } = req.body;

    const buffer = Buffer.from(imageBase64, 'base64');

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('Website')
      .upload(fileName, buffer, { contentType: 'image/png' });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data } = supabase.storage
      .from('Website')
      .getPublicUrl(fileName);

    // Insert pet into database
    const { error } = await supabase
      .from('pets')
      .insert([{ name, price, image_url: data.publicUrl }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Pet added successfully!' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}