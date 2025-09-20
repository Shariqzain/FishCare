import { useEffect, useState } from 'react';
import { Video } from 'expo-av';
import { Asset } from 'expo-asset';

export const useVideoPreload = (videoSource: number) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function preloadVideo() {
      try {
        const asset = Asset.fromModule(videoSource);
        await asset.downloadAsync();
        await Video.createAsync(
          { uri: asset.localUri ?? asset.uri },
          { shouldPlay: false, isMuted: true }
        );
        setIsReady(true);
      } catch (error) {
        console.warn('Error preloading video:', error);
        setIsReady(true); // Set to true even on error to not block rendering
      }
    }

    preloadVideo();
  }, [videoSource]);

  return isReady;
};