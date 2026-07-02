import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Live keyboard height in px (0 when hidden).
 *
 * Why this exists: on modern Android (edge-to-edge, SDK 52+) `adjustResize`
 * no longer resizes the window, so KeyboardAvoidingView with
 * `behavior=undefined` does nothing and inputs hide under the keyboard.
 * Tracking the reported keyboard height and padding by it works identically
 * on iOS, Android and web.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvt, (e) => setHeight(e.endCoordinates?.height ?? 0));
    const onHide = Keyboard.addListener(hideEvt, () => setHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return height;
}
