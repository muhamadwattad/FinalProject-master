import App from './App';
import { AppRegistry, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { React } from 'react'
import { Root } from 'native-base'
import { name as appName } from './app.json';
LogBox.ignoreLogs(['Warning: ...']);
const FinalApp = () => {

    <Root>
        <App />
    </Root>
}
AppRegistry.registerComponent(appName, () => FinalApp);