import { config } from './config';
import { Ingedient } from './model/food';
import { Observable, Observer } from 'rxjs/Rx';
import { ITweet } from './model/tweet';
import * as _ from 'lodash';
import { isUndefined } from 'util';
const Twitter = require('twitter');

const io = require('socket.io')(3000);

const client = new Twitter(config);

let ingredients = [
    // Rice
    'rice',

    // Fishes
    'salmon',
    'tuna',
    'crab',
    'surimi',

    // Garnishes
    'cheese',
    'avocado',
    'cucumber',
    'strawberry',

    // Sauces
    'wasabi',
    'soja',

    // Wraps
    'algua',
    'egg',
];

const tweet$: Observable<ITweet> = Observable.create((observer: Observer<Ingedient>) => {
    client.stream('statuses/filter', {
        track: ingredients.join(','),
    }, (stream) => {
        stream.on('data', function (event) {
            observer.next(event);
        });

        stream.on('error', function (error) {
            console.log(`error ${error}`);
        })
    })
});

const food$: Observable<Ingedient> =
    tweet$
        .filter(tweet => !!tweet.text)
        .map(tweet => {
            const ingredient = _.find(ingredients, (ingredient) => {
                return _.includes(tweet.text.toLocaleLowerCase(), ingredient)
                    || (tweet.quoted_status && _.includes(tweet.quoted_status.text.toLocaleLowerCase(), ingredient))
            });

            // if (isUndefined(ingredient)) {
            //     console.log('Ingredient not found');
            //     console.log('tweet', tweet.text);
            //     console.log('quote', tweet.quoted_status ? tweet.quoted_status.text : '');
            // }

            return new Ingedient(ingredient, tweet.text, tweet.id);
        })
        .filter(ingredients => !isUndefined(ingredients.name));


food$
    .do(console.log)
    .subscribe((obj) => io.emit('ingredient', obj));
