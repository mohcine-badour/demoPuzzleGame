import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Puzzle from './src/components/Puzzle';
import { COLORS } from './src/utils/Constants';

export default function App() {
  return (
    <View style={styles.container}>
        <Puzzle />
        <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
