import { RtmapPage } from './app.po';

describe('rtmap App', function() {
  let page: RtmapPage;

  beforeEach(() => {
    page = new RtmapPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
