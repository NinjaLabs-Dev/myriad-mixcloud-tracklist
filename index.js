const fs = require("fs");
const parser = require("xml-js");
const moment = require("moment");
require("dotenv").config()
const env = process.env;

const logs = fs.readdirSync('./_convert');

if(!logs) return console.error("No files found!")

logs.forEach((file) => {
    if(file === "_output") return;
    let log = fs.readFileSync(`./_convert/${file}`, { encoding: 'utf8', flag: 'r'})

    let computedLog = [];
    let start = "";

    log = parser.xml2json(log, {compact: true, spaces: 4});
    log = JSON.parse(log);
    log = log.log;

    if(log) {
        if (log.logSection.logItem) {
            let items = log.logSection.logItem;

            start = moment(items[0].estimatedStart._text);

            items.forEach((item, index) => {
                let artists = [];
                let title = "";

                if(item._attributes.type === "song") {

                    if(Array.isArray(item.artists.artist)) {
                        item.artists.artist.forEach((artist) => {
                            artists.push(artist.name._text.replace(/\s+/g, ''))
                        });

                        artists = artists.join(', ');
                    } else {
                        artists =  item.artists.artist.name._text;
                    }

                    title = item.title.title._text;

                    time = moment(item.estimatedStart._text);
                    time = moment.utc(time.diff(start)).format('mm:ss');

                    computedLog.push({
                        artist: artists,
                        title: title,
                        time: time
                    })
                }
            })
        }
    }

    let name = file;
    name = name.split("-");
    // Year, Month, Date, Time
    name = `${name[1]}-${name[2]}-${name[3]}-${name[4].split('.')[0]}.txt`

    let computedFileContent = '';

    // console.log(computedLog)
    computedLog.forEach((item) => {
        var songdet = `${item.artist} - ${item.title} ${item.time}`
        computedFileContent = computedFileContent + songdet + '\n';
    })

    fs.writeFileSync(`./_convert/_output/${name}`, computedFileContent, { encoding: "utf8", flag: "wx" })

    console.log("Written to file: " + name);
})