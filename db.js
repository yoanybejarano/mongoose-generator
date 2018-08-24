var mongoose = require('mongoose'),
    exec = require('child_process').exec,
    collectionDefinitions,
    modelGeneration;

mongoose.connect('mongodb://localhost:27017/northwind', { useNewUrlParser: true });

var connection = mongoose.connection;

connection.once('open', function () {
    console.log('Connected to mongo server.');

    connection.db.collections(function (err, collections) {

        collections.forEach(collection => {

            var collectionName = collection.collectionName;

            var dbReference = collection.dbName + '/' + collectionName
            var commandVariety = "variety " + dbReference + " --quiet --outputFormat='json'";
            collectionDefinitions = exec(commandVariety,
                function (error, stdout, stderr) {

                    var collectionsMetadata = JSON.parse(stdout);
                    console.log(collectionName);
                    var sentence = '';
                    collectionsMetadata.forEach(item => {
                        var dataTypes = Object.keys(item.value.types);
                        var dataType = dataTypes[0].charAt(0).toLowerCase() + dataTypes[0].substr(1);
                        sentence += item._id.key + ":" + dataType + ',';
                    });
                    //console.log(sentence.slice(0, - 1));

                    var modelGenerationCommand = "mongoose-gen -m " + collectionName + " -f " + sentence.slice(0, - 1) + " -r";
                    modelGeneration = exec(modelGenerationCommand,
                        function (error, stdout, stderr) {
                            console.log('stdout: ' + stdout);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                        });

                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });               
        });
        console.log("Process finished");
    });
});

