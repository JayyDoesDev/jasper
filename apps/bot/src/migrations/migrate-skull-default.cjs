const { config } = require('dotenv');
const mongoose = require('mongoose');

const GuildModel = require('../models/guildSchema');
const schema = GuildModel.default;
config();

async function migrateSkullDefault() {
    await mongoose.connect(process.env.MONGODB);

    const guilds = await schema.updateMany(
        {
            $or: [
                { 'Skullboard.SkullboardEmoji': { $exists: false } },
                { 'Skullboard.SkullboardEmoji': { $eq: null } },
                { 'Skullboard.SkullboardEmoji': { $size: 0 } },
            ],
        },
        {
            $set: {
                'Skullboard.SkullboardEmoji': '💀',
            },
        },
    );

    console.log(`Updated ${guilds.modifiedCount} guilds with default Skullboard emoji.`);
    mongoose.connection.close();
}

migrateSkullDefault().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});
