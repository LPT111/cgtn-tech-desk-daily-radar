export const SOURCES = [
  { name: '新浪科技', tier: 'mainstream', type: 'html', url: 'https://tech.sina.com.cn/', parser: 'sina', weight: 12 },
  { name: 'IT之家', tier: 'industry', type: 'rss', url: 'https://www.ithome.com/rss/', parser: 'rss', weight: 10 },
  { name: '快科技-综合', tier: 'industry', type: 'rss', url: 'https://rss.mydrivers.com/Rss.aspx?Tid=1', parser: 'rss', weight: 9 },
  { name: '快科技-硬件', tier: 'industry', type: 'rss', url: 'https://rss.mydrivers.com/Rss.aspx?cid=9', parser: 'rss', weight: 9 },
  { name: '快科技-科学', tier: 'industry', type: 'rss', url: 'https://rss.mydrivers.com/Rss.aspx?cid=192', parser: 'rss', weight: 9 },
  { name: '腾讯科技', tier: 'mainstream', type: 'html', url: 'https://tech.qq.com/', parser: 'generic', weight: 10 },
  { name: '网易科技', tier: 'mainstream', type: 'html', url: 'https://tech.163.com/', parser: 'generic', weight: 10 },
  { name: '财联社', tier: 'mainstream', type: 'html', url: 'https://www.cls.cn/telegraph', parser: 'cls', weight: 11, optional: true },
  { name: '观察者网-产业科技', tier: 'mainstream', type: 'html', url: 'https://www.guancha.cn/industry-science/', parser: 'generic', weight: 8 },
  { name: '36氪', tier: 'industry', type: 'rss', url: 'https://36kr.com/feed', parser: 'rss', weight: 7 },
  { name: '机器之心', tier: 'research', type: 'html', url: 'https://www.jiqizhixin.com/', parser: 'generic', weight: 8 },
  { name: '量子位', tier: 'industry', type: 'html', url: 'https://www.qbitai.com/', parser: 'generic', weight: 6 },
  { name: 'TechNode', tier: 'international', type: 'rss', url: 'https://technode.com/feed/', parser: 'rss', weight: 7 },

  { name: '科技日报', tier: 'official', type: 'html', url: 'https://www.stdaily.com/', parser: 'stdaily', weight: 14 },
  { name: '中国科学院', tier: 'official', type: 'html', url: 'https://www.cas.cn/yw/', parser: 'cas', weight: 14 },
  { name: '中国科学报', tier: 'research', type: 'html', url: 'https://news.sciencenet.cn/', parser: 'sciencenet', weight: 10 },
  { name: '人民网-科技', tier: 'mainstream', type: 'html', url: 'http://scitech.people.com.cn/', parser: 'people', weight: 10 },
  { name: '新华网-科技', tier: 'mainstream', type: 'html', url: 'http://www.news.cn/tech/', parser: 'news-cn', weight: 10 },
  { name: '光明网-科技', tier: 'mainstream', type: 'html', url: 'https://tech.gmw.cn/', parser: 'gmw', weight: 8 },
  { name: '央广网-科技', tier: 'mainstream', type: 'html', url: 'https://tech.cnr.cn/', parser: 'cnr', weight: 8 },
  { name: '中国日报-科技', tier: 'mainstream', type: 'html', url: 'https://cn.chinadaily.com.cn/5bd5639ca3101a87ca8ff636', parser: 'generic', weight: 8 },
  { name: '央视新闻科技', tier: 'official', type: 'html', url: 'https://news.cctv.com/tech/', parser: 'cctv', weight: 6, optional: true },
  { name: '央视网-科技', tier: 'official', type: 'html', url: 'https://tech.cctv.com/', parser: 'cctv', weight: 5, optional: true },

  { name: '工信部', tier: 'official', type: 'html', url: 'https://www.miit.gov.cn/xwdt/gxdt/index.html', parser: 'generic', weight: 12 },
  { name: '工信部-政策文件', tier: 'official', type: 'html', url: 'https://www.miit.gov.cn/zwgk/zcwj/index.html', parser: 'generic', weight: 13 },
  { name: '科技部', tier: 'official', type: 'html', url: 'https://www.most.gov.cn/kjbgz/', parser: 'generic', weight: 12 },
  { name: '科技部-国际合作', tier: 'official', type: 'html', url: 'https://www.most.gov.cn/kjbgz/202101/t20210121_161685.html', parser: 'generic', weight: 10, optional: true },
  { name: '国家网信办', tier: 'official', type: 'html', url: 'https://www.cac.gov.cn/', parser: 'generic', weight: 10 },
  { name: '国家网信办-政策', tier: 'official', type: 'html', url: 'https://www.cac.gov.cn/zcjd/A090101index_1.htm', parser: 'generic', weight: 12, optional: true },
  { name: '发改委', tier: 'official', type: 'html', url: 'https://www.ndrc.gov.cn/xwdt/', parser: 'generic', weight: 8 },
  { name: '市场监管总局', tier: 'official', type: 'html', url: 'https://www.samr.gov.cn/xw/', parser: 'generic', weight: 8 },
  { name: '国务院政策文件', tier: 'official', type: 'html', url: 'https://www.gov.cn/zhengce/zhengceku/', parser: 'generic', weight: 13 },
  { name: '国务院要闻', tier: 'official', type: 'html', url: 'https://www.gov.cn/yaowen/', parser: 'generic', weight: 9 },
  { name: '外交部发言', tier: 'official', type: 'html', url: 'https://www.mfa.gov.cn/web/wjdt_674879/fyrbt_674889/', parser: 'generic', weight: 11 },
  { name: '新华社-政策与国际', tier: 'mainstream', type: 'html', url: 'http://www.news.cn/politics/', parser: 'news-cn', weight: 10 }
];

export const TIER_SCORE = {
  official: 20,
  mainstream: 12,
  industry: 8,
  research: 14,
  company: 8,
  international: 8
};

export const GLOBAL_SOURCES = [
  { name: 'AP Technology', tier: 'international', region: 'US', type: 'html', url: 'https://apnews.com/hub/technology', parser: 'generic', weight: 10 },
  { name: 'France24 Technology', tier: 'international', region: 'Europe', type: 'html', url: 'https://www.france24.com/en/tag/technology/', parser: 'generic', weight: 8 },
  { name: 'Reuters Technology', tier: 'international', region: 'Global', type: 'html', url: 'https://www.reuters.com/technology/', parser: 'generic', weight: 12 },
  { name: 'TechCrunch', tier: 'international', region: 'US', type: 'rss', url: 'https://techcrunch.com/feed/', parser: 'rss', weight: 9 },
  { name: 'The Verge', tier: 'international', region: 'US', type: 'rss', url: 'https://www.theverge.com/rss/index.xml', parser: 'rss', weight: 8 },
  { name: 'Yahoo News Technology', tier: 'international', region: 'US', type: 'html', url: 'https://www.yahoo.com/tech/', parser: 'generic', weight: 7 },
  { name: 'WIRED Science', tier: 'international', region: 'US', type: 'rss', url: 'https://www.wired.com/feed/category/science/latest/rss', parser: 'rss', weight: 8 },
  { name: 'WIRED Business', tier: 'international', region: 'US', type: 'rss', url: 'https://www.wired.com/feed/category/business/latest/rss', parser: 'rss', weight: 8 },
  { name: 'MIT Technology Review', tier: 'international', region: 'US', type: 'rss', url: 'https://www.technologyreview.com/feed/', parser: 'rss', weight: 8 },
  { name: 'The Register', tier: 'international', region: 'Europe', type: 'rss', url: 'https://www.theregister.com/headlines.atom', parser: 'rss', weight: 8 },
  { name: 'Ars Technica', tier: 'international', region: 'US', type: 'rss', url: 'https://feeds.arstechnica.com/arstechnica/index', parser: 'rss', weight: 8 },
  { name: 'Engadget', tier: 'international', region: 'US', type: 'rss', url: 'https://www.engadget.com/rss.xml', parser: 'rss', weight: 7 },
  { name: 'CNBC Technology', tier: 'international', region: 'US', type: 'rss', url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', parser: 'rss', weight: 7 },
  { name: 'Rest of World', tier: 'international', region: 'Global', type: 'rss', url: 'https://restofworld.org/feed/latest/', parser: 'rss', weight: 7 },
  { name: 'Science News', tier: 'international', region: 'Global', type: 'rss', url: 'https://www.sciencenews.org/feed', parser: 'rss', weight: 7 },
  { name: 'White House OSTP', tier: 'international', region: 'US', type: 'html', url: 'https://www.whitehouse.gov/ostp/news-updates/', parser: 'generic', weight: 12 },
  { name: 'NIST AI', tier: 'international', region: 'US', type: 'html', url: 'https://www.nist.gov/artificial-intelligence', parser: 'generic', weight: 11 },
  { name: 'US Commerce BIS', tier: 'international', region: 'US', type: 'html', url: 'https://www.bis.gov/newsroom', parser: 'generic', weight: 11, optional: true },
  { name: 'EU AI Office', tier: 'international', region: 'Europe', type: 'html', url: 'https://digital-strategy.ec.europa.eu/en/policies/ai-office', parser: 'generic', weight: 10, optional: true },
  { name: 'OECD AI Policy', tier: 'international', region: 'Global', type: 'html', url: 'https://oecd.ai/en/wonk', parser: 'generic', weight: 9, optional: true },
  { name: 'Stanford HAI Policy', tier: 'international', region: 'US', type: 'html', url: 'https://hai.stanford.edu/news', parser: 'generic', weight: 8 }
];

export const VIDEO_SOURCES = [
  {
    platform: 'TikTok',
    url: 'https://www.tiktok.com/search?q=China%20technology',
    searchBase: 'https://www.tiktok.com/search?q='
  },
  {
    platform: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=China+technology',
    searchBase: 'https://www.youtube.com/results?search_query='
  },
  {
    platform: '抖音',
    url: 'https://www.douyin.com/search/%E4%B8%AD%E5%9B%BD%E7%A7%91%E6%8A%80',
    searchBase: 'https://www.douyin.com/search/'
  }
];
