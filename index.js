// import { graphiqlHapi } from 'apollo-server-hapi';
const{graphqlHapi,graphiqlHapi}=require('apollo-server-hapi');
const graphql=require('graphql');
const hapi=require('hapi');
const mongoose=require('mongoose');
const Painting=require('./models/Painting');
const schema=require('./graphql/schema');
mongoose.connect('mongodb://localhost/modern-api');
mongoose.connection.once('open',()=>{
    console.log('database connected');
})
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const server=hapi.server({
    port:4000,
    host:'localhost'
})

const init=async()=>{
    await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				info: {
					title: 'Paintings API Documentation',
					version: Pack.version
				}
			}
		}
	]);
    await server.register({
		plugin: graphiqlHapi,
		options: {
			path: '/graphiql',
			graphiqlOptions: {
				endpointURL: '/graphql'
			},
			route: {
				cors: true
			}
		}
	});

	await server.register({
		plugin: graphqlHapi,
		options: {
			path: '/graphql',
			graphqlOptions: {
				schema
			},
			route: {
				cors: true
			}
		}
	});
    server.route([
        {
            method:'get',
            path:'/',
            config: {
				description: 'home page',
				tags: ['api', 'v1', 'painting']
			},
            handler:function(request,reply){
                return '<h1>MY TEST API welcome murali!</h1>';
            }
        },
        {
            method:'get',
            path:'/api/v1/paintings',
            config: {
				description: 'Get all the paintings',
				tags: ['api', 'v1', 'painting']
			},
            handler:function(request,reply){
                return  Painting.find();
            }
        },
        
        {
            method:'post',
            path:'/api/v1/paintings',
            config: {
				description: 'post painting',
				tags: ['api', 'v1', 'painting']
			},
            handler:function(request,reply){
                const {name,url,techniques}=request.payload;
                const painting=new Painting({
                    name,
                    url,
                    techniques
                })
                return  painting.save();
            }
        }
    ])
    

    await server.start();
    console.log(`server running on ${server.info.uri}`);
}

init();