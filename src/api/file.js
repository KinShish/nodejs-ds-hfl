const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');

exports.plugin = {
    name:    'file',
    version: '0.0.1',
    register: async (server) => {
        server.route({
            method: 'POST',
            path:   '/text',
            config: {
                async handler(req) {
                    return req.payload.text
                },
                description: 'Обзор всех категорий',
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