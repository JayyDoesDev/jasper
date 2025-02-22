const mongoose = require('mongoose');
const { config } = require('dotenv');
const GuildModel = require('../Models/GuildSchema');
const schema = GuildModel.default;
config();

async function migrateTopics() {
    await mongoose.connect(process.env.MONGODB);

    const defaultTopics = [
        'If you could have any superpower, what would it be and why?',
        'What would you do if you woke up one day and could talk to animals?',
        'If you could invent a new holiday, what would it be about?',
        'What would you do if you found a treasure chest buried in your backyard?',
        'If you could live inside any video game, which one would you choose?',
        'What would you do if you could switch places with your pet for a day?',
        'If you could visit any planet in the solar system, which one would you pick?',
        'What would you do if you had a time machine?',
        'If you could make one rule that everyone in the world had to follow, what would it be?',
        'What would you do if you woke up one morning and everything was upside down?',
        'If you could create your own magical creature, what would it look like?',
        'What would you do if you could become invisible for a day?',
        'If you could have any animal as a pet (even a dinosaur!), which one would you choose?',
        'What would you do if you could fly like a bird?',
        'If you could design your own amusement park, what rides would you have?',
        'What would you do if you found a door that led to another world?',
        'If you could be the main character in any book or movie, who would you choose?',
        'What would you do if you woke up with a talking robot as your best friend?',
        'If you could turn into any mythical creature, which one would you pick?',
        'What would you do if you could breathe underwater?',
        'If you had to eat only one food for the rest of your life, what would it be?',
        'What would you do if you were the president for a day?',
        'If you could make one wish come true, what would you wish for?',
        'What would you do if you found a magic wand?',
        'If you could trade places with any famous person for a day, who would it be?',
        'What would you do if you discovered a hidden treasure map?',
        'If you could bring any fictional character to life, who would it be?',
        'What would you do if you could travel to the past and meet a famous historical figure?',
        'If you could have a house made of anything (candy, LEGO, etc.), what would you pick?',
        'What would you do if you could control the weather for a day?',
        'If you had a pet dragon, what would you name it?',
        'What would you do if you could shrink down to the size of an ant?',
        'If you could make a new ice cream flavor, what would it be?',
        'What would you do if you found out your toys could talk?',
        'If you could design your own school, what cool things would you add?',
        'What would you do if you had a magic carpet that could take you anywhere?',
        'If you could have any job in the world, what would it be?',
        'What would you do if you could turn into any animal at will?',
        'If you could be any age forever, what age would you choose?',
        'What would you do if you had a spaceship of your own?',
        'If you could live in any fictional world (Harry Potter, Star Wars, etc.), where would you go?',
        'What would you do if you had a secret hideout that no one else knew about?',
        'If you could create a new sport, what would the rules be?',
        'What would you do if you could live in a castle for a week?',
        'If you had a robot assistant, what tasks would you give it?',
        'What would you do if you woke up with the ability to read minds?',
        'If you could explore the deep ocean, what creatures would you hope to see?',
        'What would you do if you could swap places with your favorite cartoon character?',
        'If you could mix two animals together to make a new species, what would it be?',
        'What would you do if you could make anything you draw come to life?',
        'If you could build your own dream house, what crazy features would it have?',
    ];

    const guilds = await schema.updateMany(
        {
            $or: [
                { 'GuildSettings.Text.Topics': { $exists: false } },
                { 'GuildSettings.Text.Topics': { $eq: null } },
                { 'GuildSettings.Text.Topics': { $size: 0 } },
            ],
        },
        { $set: { 'GuildSettings.Text.Topics': defaultTopics } },
    );

    console.log(`Updated ${guilds.modifiedCount} guilds with default topics.`);
    mongoose.connection.close();
}

migrateTopics().catch((err) => {
    console.error(err);
    mongoose.connection.close();
});
