import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList, 
  TouchableOpacity
} from 'react-native';


const { Gateway, Wallets } = require('fabric-network');
var RNFS = require('react-native-fs');

const fetchWallet = async () =>{
  const walletFileUrl = `http://192.168.0.102:81/appuser.id`;

  //path.resolve(__dirname, '..', 'components', 'appuser.id');
  const walletPath = `${Platform.OS==="android"?"/storage/emulated/0/Download":RNFS.TemporaryDirectoryPath}/appuser.id`;
  
  RNFS.downloadFile({
    fromUrl: walletFileUrl,
    toFile: walletPath
  }).promise
    .then((result) => {
      console.log(walletPath);  //here you get temporary path
  })
  .catch((e) => {
    console.log(e,"error");
  });
  
  return await Wallets.newFileSystemWallet(walletPath); //await Wallets.newInMemoryWallet();
}

const fetchCCP = async () => {
  const ccpFileUrl = `http://192.168.0.102:81/connection-org1.json`;

  //path.resolve(__dirname, '..', 'components', 'connection-org1.json');
  const ccpPath = `${Platform.OS==="android"?"/storage/emulated/0/Download":RNFS.TemporaryDirectoryPath}/connection-org1.json`;

  RNFS.downloadFile({
      fromUrl: ccpFileUrl,
      toFile: ccpPath
    }).promise
      .then((result) => {
        console.log(ccpPath);  //here you get temporary path
    })
    .catch((e) => {
      console.log(e,"error");
    });

    const contents = fs.readFileSync(ccpPath, 'utf8');
    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    console.log(ccp);
    return ccp;
}

const getAllAssets = async () => {
    const org1UserId = 'appUser';
    const channelName = "mychannel";
    const chaincodeName = "basic";
    const wallet = await fetchWallet();
    const ccp    = await fetchCCP();
    const gateway = new Gateway();
    // setup the gateway instance
    // The user will now be able to create connections to the fabric network and be able to
    // submit transactions and query. All transactions submitted by this gateway will be
    // signed by this user using the credentials stored in the wallet.
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork(channelName);

    // Get the contract from the network.
    const contract = network.getContract(chaincodeName);

    let result = await contract.evaluateTransaction('GetAllAssets');

    return JSON.parse(result);
}

const App = () => {

  return (
    <View style={styles.container}>
      <FlatList
        data={() => getAllAssets()}
        renderItem={({item}) => <Text style={styles.textViewContainer}>{item.assetID}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  textViewContainer: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
