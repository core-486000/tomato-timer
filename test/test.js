'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');

describe('/', () => {
  test('/timerにリダイレクトされる', async () => {
    await request(app)
      .get('/logout')
      .expect('Location', '/timer')
      .expect(302);
  });
});

describe('/login', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall();
  });

  test('ログインのためのリンクが含まれる', async () => {
    await request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/github"/)
      .expect(200);
  });

  test('ログイン時はユーザ名が表示される', async () => {
    await request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200);
  });
});

describe('/logout', () => {
  test('/timerにリダイレクトされる', async () => {
    await request(app)
      .get('/logout')
      .expect('Location', '/timer')
      .expect(302);
  });
});

describe('/timer/update', () => {
  test('タイマー時間のCookieが更新できる', async () => {
    const { formToken, cookieToken } = await getCSRFTokens();
    // 更新がされることをテスト
    await request(app)
      .post('/timer/update')
      .set('Cookie', `csrfToken=${cookieToken}`)
      .send({
        _csrf: formToken,
        workTime: 45, 
        breakTime: 10, 
        loop: 3, 
        lastBreakTime: 20 
      })
      .expect('set-cookie', /workTime=45;/)
      .expect('set-cookie', /breakTime=10;/)
      .expect('set-cookie', /loop=3;/)
      .expect('set-cookie', /lastBreakTime=20;/);
  });
});

async function getCSRFTokens() {
  const response = await request(app).get('/timer');
  return {
    formToken: response.text.match(/<input type="hidden" name="_csrf" value="(.+?)">/)[1],
    cookieToken: response.headers['set-cookie'][0].match(/csrfToken=(.+?);/)[1]
  };
}