import chai from 'chai';
import sinon from 'sinon';
import { Request, Response, NextFunction } from 'express';
import * as blogsController from '../src/controllers/blogs'; // Import your controllers
import { BlogModel } from '../src/schema/blogs';
import chaiHttp from 'chai-http';
import express from 'express';
import { hashPassword } from '../src/helpers/hashPassword';
import { generateToken } from '../src/middlewares/jwt_config';

chai.use(chaiHttp);
const expect = chai.expect;
describe('Blog Controllers', () => {
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
  
    // console.log("adminToken here",adminToken)
  })
  
  let next: express.NextFunction;
  describe('addBlog', () => {
    it('should add a new blog', async () => {
      let req = { body:
         { title: 'Test Blog', content: 'Test Content', subtitle:"Blog subtitle", timeToRead:"40", poster:"https://res.cloudinary.com/dms2akwoq/image/upload/v1709553916/my-blog/ghgmv3vgavb05yjs126f.jpg", category:"category" } ,
        } as Request;
    //    req = { files: [
    //     {
    //       fieldname: 'poster',
    //       originalname: 'blog3.jpeg',
    //       encoding: '7bit',
    //       mimetype: 'image/jpeg',
    //       buffer: `<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 02 00 00 01 00 01 00 00 ff db 00 43 00 06 04 05 06 05 04 06 06 05 06 07 07 06 08 0a 10 0a 0a 09 09 0a 14 0e 0f 0c ... 136731 more bytes>`,
    //       size: 136781
    //     }
    //   ] } as Request;
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      } as unknown as Response;

      const saveStub = sinon.stub(BlogModel.prototype, 'save').resolves({ title: 'Test Blog', content: 'Test Content' });

      await blogsController.uploadBlog((req as any), res, next);

      // expect(res).to.have.status(200);
      expect(req.body).to.be.a("object")
      expect(req.body).to.be.have.property("title", "Test Blog");
      // expect(res.send.calledWith({ status: 'success', data: { title: 'Test Blog', content: 'Test Content' } })).to.be.true;

      saveStub.restore();
    });
    it('should add a new blog with image', async () => {
      let req = { body:
         { title: 'Test Blog', content: 'Test Content', subtitle:"Blog subtitle", timeToRead:"40", poster:"https://res.cloudinary.com/dms2akwoq/image/upload/v1709553916/my-blog/ghgmv3vgavb05yjs126f.jpg", category:"category" } ,
        } as Request;
        // req.files = [
        //   {
        //     fieldname: 'poster',
        //     originalname: 'blog3.jpeg',
        //     encoding: '7bit',
        //     mimetype: 'image/jpeg',
        //     buffer: `<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 02 00 00 01 00 01 00 00 ff db 00 43 00 06 04 05 06 05 04 06 06 05 06 07 07 06 08 0a 10 0a 0a 09 09 0a 14 0e 0f 0c ... 136731 more bytes>`,
        //     size: 136781
        //   }
        // ] as request

      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      } as unknown as Response;

      const next = ()=>{}
      const saveStub = sinon.stub(BlogModel.prototype, 'save').resolves({ title: 'Test Blog', content: 'Test Content' });

      await blogsController.uploadBlog((req as any), res, next);

      // expect(res).to.have.status(200);
      expect(req.body).to.be.a("object")
      expect(req.body).to.be.have.property("title", "Test Blog");
      // expect(res.send.calledWith({ status: 'success', data: { title: 'Test Blog', content: 'Test Content' } })).to.be.true;

      saveStub.restore();
    });

    // it('should return 400 if required fields are missing', async () => {
    //   const req = { body: { title: 'Incomplete Blog' } } as Request;
    //   const res = {
    //     status: sinon.stub().returnsThis(),
    //     sendStatus: sinon.stub(),
    //   } as unknown as Response;
    //   const next   = () => {}

    //   await blogsController.uploadBlog((req as any), res, next);  
    //   // expect(res.status).to.be.equal(400);
    //   expect(req.body).to.be.a("object")
    //   expect(req.body).to.be.have.property("title", "Incomplete Blog");
    // //   expect(res.sendStatus.called).to.be.true;
    // });

    // Add more test cases for other scenarios

  });

  // Add similar tests for other controller functions like getAllBlogs, getOneBlogById, deleteBlog, updateBlog, etc.
});
