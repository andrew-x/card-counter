/* eslint-disable @next/next/no-img-element */
'use client'

import { scanCards } from '@/actions/scan'
import { Button, Drawer } from '@mantine/core'
import { CameraIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

type ScanDrawerProps = {
  opened: boolean
  onClose: () => void
  valueMap: Record<string, number>
  onConfirm: (score: number) => void
}

type ScanResult = {
  recognizedCards: string[]
  totalScore: number
  confidence: number
}

export default function ScanDrawer({
  opened,
  onClose,
  valueMap,
  onConfirm,
}: ScanDrawerProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera when drawer opens
  useEffect(() => {
    if (opened) {
      startCamera()
    } else {
      cleanup()
    }
  }, [opened])

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCapturedImage(null)
    setScanResult(null)
    setIsScanning(false)
  }

  const handleClose = () => {
    cleanup()
    onClose()
  }

  const captureAndScan = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageData)

        // Stop the camera stream after capturing
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        // Immediately start scanning
        setIsScanning(true)
        try {
          const result = await scanCards({
            image: imageData,
            valueMap: valueMap,
          })

          if (result?.data) {
            setScanResult(result.data)
          }
        } finally {
          setIsScanning(false)
        }
      }
    }
  }

  const confirmScanResult = () => {
    if (scanResult) {
      onConfirm(scanResult.totalScore)
      handleClose()
    }
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
        {!capturedImage ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Position your cards in the camera view and tap to scan
            </p>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={captureAndScan}
                className="flex-1"
                leftSection={<CameraIcon size={16} />}
                loading={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan Cards'}
              </Button>
              <Button variant="subtle" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isScanning ? (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
                  <img
                    src={capturedImage}
                    alt="Captured cards"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center py-4">
                  <div className="text-gray-600">Analyzing cards...</div>
                </div>
              </>
            ) : scanResult ? (
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
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Scan Results
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">
                            Recognized Cards:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scanResult.recognizedCards.map((card, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {card}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Total Score:
                          </span>
                          <span className="ml-2 font-semibold text-lg text-gray-900">
                            {scanResult.totalScore}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Confidence:
                          </span>
                          <span className="ml-2 text-sm text-gray-700">
                            {Math.round(scanResult.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={confirmScanResult} className="flex-1">
                        Confirm Score
                      </Button>
                      <Button variant="subtle" onClick={handleClose}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Button variant="subtle" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Drawer>
  )
}
