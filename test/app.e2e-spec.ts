import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      })
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'example@gmail.com',
      password: '123'
    };
    
    describe('Signup', () => {
      it('should throw exception if email empty', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            email: ''
          })
          .expectStatus(400);
          // .inspect();
      });

      it('should throw exception if password empty', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody({
            ...dto,
            password: ''
          })
          .expectStatus(400);
        // .inspect();
      });

      it('should throw exception if no body', () => {
        return pactum.spec()
          .post('/auth/signup')
          // .withBody({})
          .expectStatus(400);
        // .inspect();
      });
      
      it('should signup', () => {
        return pactum.spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
          // .inspect();
      });
    });

    describe('Signin', () => {
      it('should throw exception if email empty', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            email: ''
          })
          .expectStatus(400);
        // .inspect();
      });

      it('should throw exception if password empty', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody({
            ...dto,
            password: ''
          })
          .expectStatus(400);
        // .inspect();
      });

      it('should throw exception if no body', () => {
        return pactum.spec()
          .post('/auth/signin')
          // .withBody({})
          .expectStatus(400);
        // .inspect();
      });
      
      it('should signin', () => {
        return pactum.spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
          // .inspect();
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum.spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200);
          // .inspect();
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'John',
          email: 'example3@gmail.com'
        };

        return pactum.spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
          // .inspect();
      })
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectBody([]);
      })
    });

    describe('Create bookmark', () => {
      /* const dto: CreateBookmarkDto = {
        title: 'Learn JavaScript /w 7 games',
        description: 'Learn JavaScript by Building 7 Games - Full Course',
        link: 'https://www.youtube.com/watch?v=ec8vSKJuZTk'
      }; */
      const dto: CreateBookmarkDto = {
        title: 'Building Microservices with .NET',
        link: 'https://www.youtube.com/watch?v=CqCDOosvZIk'
      };

      it('should create bookmark', () => {
        return pactum.spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmarkId', 'id')
          // .inspect();
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectJsonLength(1);
          // .inspect();
      })
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum.spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      })
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: '.NET Microservices – Full Course for Beginners',
        description: 'Learn the foundational elements of a microservices architecture with .NET in this beginner level course. You will incrementally building a real microservices-based application with the .NET platform and C#.'
      };
      
      it('should edit bookmark by id', () => {
        return pactum.spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => { 
      it('should delete bookmark by id', () => {
        return pactum.spec()
          .delete(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(204)
          .inspect();
      });

      it('should get empty bookmarks', () => {
        return pactum.spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{userAccessToken}`
          })
          .expectStatus(200)
          .expectJsonLength(0)
          .inspect();
      })
    });
  });
});