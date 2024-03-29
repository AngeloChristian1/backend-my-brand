import  jwt  from 'jsonwebtoken';
import { BlogModel } from './../src/schema/blogs';
import chai, { should } from 'chai';
import chaiHttp from 'chai-http';
import { describe, it } from 'mocha';
import { app } from './index.spec'; 
import { createServer, Server } from "http";
import { generateToken } from '../src/middlewares/jwt_config';
import { isAuthenticated } from '../src/middlewares';
import {promises as fs} from 'fs'
import { hashPassword } from '../src/helpers/hashPassword';

chai.use(chaiHttp);
const expect = chai.expect;
let server: Server;



// before((done) => {
//   server = createServer(app);
//   server.listen(7000, done);
// });

// after((done) => {
//   server.close(done);
// });

describe("Testing Middlewares", ()=>{

})

describe('Blog API Testing', () => {
  let adminToken: any = undefined
before("getting admin token",()=>{
  let userData = {
    role:"admin",
    name:"admin",
    email:"admin@example.com",
    password:"123456"
  }

  let hashedPassword = hashPassword(userData.password)
  userData.password  = hashedPassword.toString()
  adminToken = generateToken(userData)

  console.log("adminToken here",adminToken)
})

  describe('POST /addBlog', () => {
    it('should add a new blog', async () => {
        const params = {
            poster:"https://res.cloudinary.com/dms2akwoq/image/upload/v1709553916/my-blog/ghgmv3vgavb05yjs126f.jpg",
            title: "Test Title",
            subtitle: "How natural language will be the corefront of programming",
            category: "software Engineering",
            content: "The Power of Prompts \n Prompt engineering has emerged as one of the most impactful innovations in artificialThe prompt revolution has only just begun.",
            timeToRead: "40",
        }
        
      const res = await chai
        .request(app)
        // .auth('user', 'pass')
        // .attach('imageField', fs.readFile('./avatar.webp'), 'avatar.png')
        .post('/blogs/add')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(params);
      expect(res).to.have.status;
      // expect(res.body).to.have.property('status', 'success');

    });
    it('should error if token is missing', async () => {
        const params = {
            poster:"https://res.cloudinary.com/dms2akwoq/image/upload/v1709553916/my-blog/ghgmv3vgavb05yjs126f.jpg",
            title: "Test Title",
            subtitle: "How natural language will be the corefront of programming",
            category: "software Engineering",
            content: "The Power of Prompts \n Prompt engineering has emerged as one of the most impactful innovations in artificialThe prompt revolution has only just begun.",
            timeToRead: "40",
        }
        
      const res = await chai
        .request(app)
        // .auth('user', 'pass')
        // .attach('imageField', fs.readFile('./avatar.webp'), 'avatar.png')
        .post('/blogs/add')
        .set('Authorization', 'Bearer ' + adminToken)
        .send(params);
      expect(res).to.have.status;
      expect(res).to.be.a("object");

    });

    it('should return 400 if required fields are missing', async () => {
      const res = await chai
        .request(app)
        .post('/blogs/add')
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ title: 'Incomplete Todo' });
      expect(res).to.have.status;
    });

    // Add more test cases for other scenarios

  });

  
  describe("GET all blogs", ()=>{
    it("Should return 200 if all blogs are returned", (done)=>{
      chai.request(app)
      .get('/blogs')
      .set('Authorization', 'Bearer ' + adminToken)
      .end((err, res)=>{
          // let mockedUserResponse = [{title:"Going to gym", content:"At 15:00"},{title:"Sleeping", content:"At 15:00"}]
          // nock(baseUrl).get(`/blogs`).reply(200, mockedUserResponse)
          
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("array");
          done()
      })

  })

  })

  // Update test cases for other endpoints
  
  describe("Update Blog", ()=>{
    it("Should return 200 blog updated", (done)=>{
      let id = '65e5b8fd48d87aac690637bc'
      const blogPayload = {
        poster: "https://res.cloudinary.com/dms2akwoq/image/upload/v1709553916/my-blog/ghgmv3vgavb05yjs126f.jpg",
        title: "Prompt Engineering: The new age",
        subtitle: "How natural language will be the corefront of programming",
        category: "software Engineering",
        content: "The Power of Prompts \n Prompt engineering has emerged as one of the most impactful innovations in artificial intelligence and software development in recent years. With the right prompts, The prompt revolution has only just begun.",
        timeToRead: "40",
    }
            // Generate a JWT token for an admin user
            const adminToken = jwt.sign({ role: 'admin' }, 'YOUR_SECRET_KEY');
  
            // Create request object with token in headers
            const req = {
              params: { id },
              body: blogPayload,
              headers: { authorization: `Bearer ${adminToken}` }, // Add token to headers
            } as unknown as Request;
      chai.request(app)
      .patch(`/blogs/update/${id}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .send(blogPayload)
      .end((err, res)=>{
          // let mockedUserResponse = [{title:"Going to gym", content:"At 15:00"},{title:"Sleeping", content:"At 15:00"}]
          // nock(baseUrl).get(`/blogs`).reply(200, mockedUserResponse)
          
          expect(res).to.have.status(401);
          // expect(res.body.message).to.be.equal("Welcome to my API");
          expect(res.body).to.be.a("object");
          done()
      })

  })

    it("Should return 400 if Fields are not full", (done)=>{
        let id = '65e5b8fd48d87aac690637bc'
        const blogPayload = {
      }
      chai.request(app)
      .patch(`/blogs/update/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(blogPayload)
      .end((err, res)=>{
          expect(res).to.have.status(403);
          // expect(res.body.message).to.be.equal("Welcome to my API");
          expect(res.body).to.be.a("object");
          done()
      })

  })
    it("Should return 404 cant find blog", (done)=>{
        let id = '65e051feca01e0074418775f'
        const blogPayload = {
          subtitle: "How natural language will be the corefront of programming",
          category: "software Engineering",
          content: "The Power of Prompts \n Prompt engineering has emerged as one of the most impactful innovations in artificial intelligence and software development in recent years. With the right prompts.",
          timeToRead: "40",
      }
      chai.request(app)
      .patch(`/blogs/${id}`)
      .set('Authorization', 'Bearer ' + adminToken)
      .send(blogPayload)
      .end((err, res)=>{
          expect(res).to.have.status(404);
          // expect(res.body.message).to.be.equal("Welcome to my API");
          expect(res.body).to.be.a("object");
          done()
      })

  })
  })
});
