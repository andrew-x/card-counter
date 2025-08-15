/* eslint-disable @next/next/no-img-element */
'use client'

import { scanCards } from '@/actions/scan'
import logger from '@/lib/logger'
import { Button, Drawer } from '@mantine/core'
import { CameraIcon, UploadIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import ScanResults from './ScanResults'

type ScanDrawerProps = {
  opened: boolean
  onClose: () => void
  valueMap: Record<string, number>
  onConfirm: (score: number) => void
}

type ScanResult = {
  recognizedCards: string[]
  totalScore: number
}

export default function ScanDrawer({
  opened,
  onClose,
  valueMap,
  onConfirm,
}: ScanDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [currentScore, setCurrentScore] = useState(0)

  const cleanup = () => {
    setPreviewImage(null)
    setScanResult(null)
    setIsScanning(false)
    setCurrentScore(0)
  }

  const handleClose = () => {
    cleanup()
    onClose()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const compressImage = (
    file: File,
    maxSizeKB: number = 1024
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 1024
        const maxHeight = 1024
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        // Start with high quality and reduce if needed
        let quality = 0.9
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)

        // Reduce quality until under size limit
        while (
          (compressedDataUrl.length * 0.75) / 1024 > maxSizeKB &&
          quality > 0.1
        ) {
          quality -= 0.1
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(compressedDataUrl)
      }

      // Load the original file
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Compress image to under 1MB
      const compressedImage = await compressImage(file, 1024)
      setPreviewImage(compressedImage)
    } catch (error) {
      logger.error('Error compressing image:', error)
      // Fallback to original file if compression fails
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const scanSelectedImage = async () => {
    if (!previewImage) return

    setIsScanning(true)
    try {
      const result = await scanCards({
        image: previewImage,
        valueMap: valueMap,
      })

      if (result?.data) {
        setScanResult(result.data)
      }
    } finally {
      setIsScanning(false)
    }
  }

  const handleScoreChange = (newScore: number) => {
    setCurrentScore(newScore)
  }

  const confirmScanResult = () => {
    onConfirm(currentScore)
    handleClose()
  }

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      title="Scan Cards"
      position="bottom"
      size="100%"
      overlayProps={{ opacity: 0.5, blur: 4 }}
      transitionProps={{ duration: 300, transition: 'slide-up' }}
      withCloseButton={false}
      radius="lg"
      styles={{
        content: {
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        },
        header: {
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          paddingBottom: '8px',
        },
      }}
    >
      <div className="space-y-4">
        {!previewImage ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Select or take a photo of your cards to scan
            </p>
            <div
              onClick={handleUploadClick}
              className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors duration-200 group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                  <CameraIcon size={32} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Take Photo or Upload Image
                  </p>
                  <p className="text-sm text-gray-500">
                    Tap to open camera or select from gallery
                  </p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex justify-center">
              <Button variant="subtle" onClick={handleClose} className="">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!scanResult && (
              <div className="flex justify-center">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] w-full max-w-sm max-h-64">
                  <img
                    src={previewImage}
                    alt="Selected cards"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {!scanResult ? (
              <div className="flex justify-center gap-2">
                <Button
                  onClick={scanSelectedImage}
                  leftSection={<UploadIcon size={16} />}
                  loading={isScanning}
                >
                  {isScanning ? 'Analyzing...' : 'Scan Cards'}
                </Button>
                <Button variant="subtle" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scanResult.recognizedCards.length === 0 ? (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">
                      No Cards Detected
                    </h4>
                    <p className="text-sm text-red-700 mb-3">
                      We couldn&apos;t detect any cards in this image. Please
                      make sure:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 mb-4 list-disc list-inside">
                      <li>Cards are clearly visible and well-lit</li>
                      <li>Cards are not overlapping too much</li>
                      <li>The image is not blurry</li>
                    </ul>
                    <div className="flex gap-2">
                      <Button
                        variant="subtle"
                        onClick={() => {
                          setScanResult(null)
                          setPreviewImage(null)
                        }}
                        className="flex-1"
                      >
                        Try Another Image
                      </Button>
                      <Button variant="subtle" onClick={handleClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ScanResults
                      initialCards={scanResult.recognizedCards}
                      valueMap={valueMap}
                      onScoreChange={handleScoreChange}
                    />

                    <div className="flex justify-center gap-2">
                      <Button onClick={confirmScanResult}>Confirm Score</Button>
                      <Button variant="subtle" onClick={handleClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  )
}
