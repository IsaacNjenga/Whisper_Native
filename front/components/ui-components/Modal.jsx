import { View, StyleSheet } from "react-native";
import { Portal } from "react-native-paper";

function Modal({ visible, component }) {
  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <View style={styles.overlay}>{component}</View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
});

export default Modal;
