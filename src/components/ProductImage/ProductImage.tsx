import { useEffect, useState } from 'react'

type Props = {
  image?: string | File
  alt: string
  className?: string
  fallbackClassName?: string
  fallbackText?: string
}

export default function ProductImage({
  image,
  alt,
  className = 'w-16 h-16 object-cover rounded',
  fallbackClassName = 'w-16 h-16 rounded bg-gray-100 text-gray-400 text-xs flex items-center justify-center',
  fallbackText = 'No image'
}: Props) {
  const [src, setSrc] = useState<string | undefined>(typeof image === 'string' ? image : undefined)

  useEffect(() => {
    if (image instanceof File) {
      const url = URL.createObjectURL(image)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    }
    if (typeof image === 'string') {
      setSrc(image)
      return
    }
    setSrc(undefined)
  }, [image])

  if (!src) {
    return <div className={fallbackClassName}>{fallbackText}</div>
  }

  return <img src={src} alt={alt} className={className} onError={() => setSrc(undefined)} />
}
