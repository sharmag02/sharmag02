import { supabase } from './supabase'

export class SupabaseUploadAdapter {
  loader: any

  constructor(loader: any) {
    this.loader = loader
  }

  async upload() {
    const file = await this.loader.file
    const fileName = `${Date.now()}-${file.name}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('blog_images')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { publicUrl, error: urlError } = supabase.storage
      .from('blog_images')
      .getPublicUrl(fileName)

    if (urlError) throw urlError

    return { default: publicUrl }
  }

  abort() {
    // Optional: handle abort
  }
}

// CKEditor plugin to attach the adapter
export function SupabaseUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new SupabaseUploadAdapter(loader)
  }
}
