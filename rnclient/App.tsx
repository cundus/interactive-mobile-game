import {View, Text} from 'react-native';
import React from 'react';
import {APP_CLASSNAMES} from '@src/styles/appClassnames';

const App: React.FC = () => {
  return (
    <View className={APP_CLASSNAMES.CONTAINER}>
      <View className={APP_CLASSNAMES.FIRST_SECTION} />
      <View className="flex-[2] bg-blue-200 text-center">
        <Text>Welcome</Text>
      </View>
    </View>
  );
};

export default App;
