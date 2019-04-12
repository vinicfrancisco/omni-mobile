import { createAppContainer, createStackNavigator } from 'react-navigation';
import Main from './pages/main';
import Box from './pages/box';

const Routes = createAppContainer(
  createStackNavigator({
    Main,
    Box,
  })
);

export default Routes;