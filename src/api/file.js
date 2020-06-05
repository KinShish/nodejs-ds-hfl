const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');

exports.plugin = {
    name:    'file',
    version: '0.0.1',
    register: async (server) => {
        server.route({
            method: 'POST',
            path:   '/text/ilya',
            config: {
                async handler(req) {
                    return req.payload.text
                },
                description: 'Обработка текста Илья',
                tags:        ['api'],
                validate: {
                    payload: Joi.object({
                        text: Joi.string()
                    })
                }
            }
        });
        server.route({
            method: 'POST',
            path:   '/text/ds',
            config: {
                async handler(req) {
                    return req.payload.text
                },
                description: 'Обработка текста Дима',
                tags:        ['api'],
                validate: {
                    payload: Joi.object({
                        text: Joi.string()
                    })
                }
            }
        });
    }
};
