const bot = BotManager.getCurrentBot();

/**
 * (string) msg.content: 메시지의 내용
 * (string) msg.room: 메시지를 받은 방 이름
 * (User) msg.author: 메시지 전송자
 * (string) msg.author.name: 메시지 전송자 이름
 * (Image) msg.author.avatar: 메시지 전송자 프로필 사진
 * (string) msg.author.avatar.getBase64()
 * (boolean) msg.isGroupChat: 단체/오픈채팅 여부
 * (boolean) msg.isDebugRoom: 디버그룸에서 받은 메시지일 시 true
 * (string) msg.packageName: 메시지를 받은 메신저의 패키지명
 * (void) msg.reply(string): 답장하기
 */

const TARGET_ROOMS = [ "서브번호", "테스트","뺙히릿","한신불쌍한새끼","신평마법사"];

function onMessage(msg)
{
  if(!TARGET_ROOMS.includes(msg.room))  return;

  const content = msg.content.trim();

  //테스트용 하이~
  if(content === "하이")
  {
    msg.reply("나도 "+ content + "🙌");
  }
  // 명령어 입력 실행문 @캐릭터 뜨수
  if(content.startsWith("@"))
  {
    const msgArr = content.substring(1).split(" "); // 메시지 받은걸 " "기준으로 split 아 앞에 @빼고
    const command = msgArr[0]; // 제일 처음 배열
    const msgPart = msgArr.slice(1); // 그다음 배열

    switch (command)
    {
      case "날씨":
        getWeather(msg, msgPart);
        break;

      case "로또":
      case "Lotto":
        if (msgArr[1] === "추천" || msgArr[1] ==="번호추천" || (msgArr[1] === "번호" && msgArr[2] === "추천"))
        {
          createLottonumber(msg, msgPart);
        }
        else if (isNumberString(msgPart.join("").trim()))
        {
          searchLotto(msg, msgPart);
        }
        break;
      default:
        break;

    }
  }
}

function isNumberString(s) {
  return /^\d+$/.test(s);
}

function getWeather(msg, msgPart)
{
  try
  {
    //전처리
    if(msgPart.length === 0)
    {
      msg.reply("사용법 : @날씨 [지역]");
      return;
    }
    //request
    //네이버
    // var url = "https://m.search.naver.com/search.naver?query=" + msgPart + "%20날씨";
    // var data = org.jsoup.Jsoup.connect(url)
    //     .header('Referer','https://m.search.naver.com')
    //     .get();

    // var select_txt = data.selectFirst('.select_txt');
    // var temperature_text = data.selectFirst('.temperature_text');
    // var temperature_info = data.selectFirst('.temperature_info > p');

    //다음
    var url = "https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=" + msgPart + "%20날씨";
    var data = org.jsoup.Jsoup.connect(url)
        .header('Referer','https://m.search.daum.net')
        .get();

    //한국
    var select_txt = data.selectFirst('.card_comp .area_tit .inner_header .tit'); //지역명
    var temp_text = data.selectFirst('.wrap_info'); //기온
    var temp_info = data.select('.wrap_desc .txt_desc'); //[날씨, 어제랑비교]
    var temp_detail = data.select('.list_subInfo'); //습도 돌풍 체감
    var temp_icon = temp_info.get(1).selectFirst('i.ico_weather');

    var temp_updown_text = "";
    if(temp_icon)
    {
      var className = temp_icon.className();
      if(className.includes("up"))
      {
        temp_updown_text = " 높습니다.";
      }
      else if(className.includes("down"))
      {
        temp_updown_text = " 낮습니다.";
      }
      else
      {
        temp_updown_text = "";
      }
    }

    //해외

    if(select_txt && temp_text && temp_info && temp_detail)
    {
      var result = select_txt.text().trim() + '는' + temp_info.get(0).text().trim() +' 입니다.' + '\n'+
                '기온은 ' + temp_text.text().trim() + '이며' +'\n'+
                temp_info.get(1).text().trim() +temp_updown_text+'\n'+
                temp_detail.text().trim();

    }
    else if (false)
    {

    }
    else
    {
      msg.reply("날씨 정보를 찾을 수 없어요 \n지역명을 다시 입력해주세요.");
      return;
    }

    msg.reply(result);

    //msg.reply(data.select("body").html());
  }
  catch(e)
  {
    Log.e("onMessage", "getWeatherFromNaver ::",e);
    msg.reply("getWeather에러 발생" +e);
  }

}

function createLottonumber(msg, msgPart)
{
  const randomSix = getRandomLotto();
  msg.reply("추첨번호는\n" + randomSix);
}

function getRandomLotto() 
{
  // 1~45 배열 생성 (구형 환경에도 100% 동작)
  var arr = [];
  for (var i = 1; i <= 45; i++) arr.push(i);

  // Fisher–Yates 셔플 (ES5버전)
  for (var i = arr.length - 1; i > 0; i--) 
  {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  // 앞 6개 뽑고 정렬
  return arr.slice(0, 6).sort(function(a, b) { return a - b; });
}

function searchLotto(msg, msgPart)
{
  var url = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=" + msgPart;
  var data = org.jsoup.Jsoup.connect(url)
      .ignoreContentType(true)
      .execute()
      .body();
    
  var json = JSON.parse(data);   
  var lottoNumbers = 
  [
  json.drwtNo1,
  json.drwtNo2,
  json.drwtNo3,
  json.drwtNo4,
  json.drwtNo5,
  json.drwtNo6
  ];

  var replyMsg = "🎉 로또 " + json.drwNo + "회차 결과 🎉\n" +
                 "추첨일: " + json.drwNoDate + "\n\n" +
                 "번호: " + lottoNumbers.join(', ') + "\n" +
                 "보너스: " + json.bnusNo + "\n\n" +
                 "총 판매금액: " + json.totSellamnt.toLocaleString() + "원\n" +
                 "1등 당첨자: " + json.firstPrzwnerCo + "명\n" +
                 "1등 당첨금: " + json.firstAccumamnt.toLocaleString() + "원\n" ;

  msg.reply (replyMsg);
}

/*여기서부터는 사용할 일이 없을거 같다 */

/**
 * (string) msg.content: 메시지의 내용
 * (string) msg.room: 메시지를 받은 방 이름
 * (User) msg.author: 메시지 전송자
 * (string) msg.author.name: 메시지 전송자 이름
 * (Image) msg.author.avatar: 메시지 전송자 프로필 사진
 * (string) msg.author.avatar.getBase64()
 * (boolean) msg.isDebugRoom: 디버그룸에서 받은 메시지일 시 true
 * (boolean) msg.isGroupChat: 단체/오픈채팅 여부
 * (string) msg.packageName: 메시지를 받은 메신저의 패키지명
 * (void) msg.reply(string): 답장하기
 * (string) msg.command: 명령어 이름
 * (Array) msg.args: 명령어 인자 배열
 */

function onCommand(msg) 
{

}

function onCreate(savedInstanceState, activity) 
{
//   var textView = new android.widget.TextView(activity);
//   textView.setText("Hello, World!");
//   textView.setTextColor(android.graphics.Color.DKGRAY);
//   activity.setContentView(textView);
}
function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}

function onRestart(activity) {}

function onDestroy(activity) {}

function onBackPressed(activity) {}



bot.setCommandPrefix("@"); //@로 시작하는 메시지를 command로 판단 왜있는지 모르겠음.... 기능은 없음
bot.addListener(Event.MESSAGE, onMessage);
bot.addListener(Event.COMMAND, onCommand);
bot.addListener(Event.Activity.CREATE, onCreate);
bot.addListener(Event.Activity.START, onStart);
bot.addListener(Event.Activity.RESUME, onResume);
bot.addListener(Event.Activity.PAUSE, onPause);
bot.addListener(Event.Activity.STOP, onStop);
bot.addListener(Event.Activity.RESTART, onRestart);
bot.addListener(Event.Activity.DESTROY, onDestroy);
bot.addListener(Event.Activity.BACK_PRESSED, onBackPressed);