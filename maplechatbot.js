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

const API_KEY = "test_379df74dd227525a6c0b85a59f2847ea292cffcf30a97d713f2d8a7cac4ff4cbefe8d04e6d233bd35cf2fabdeb93fb0d";
const BASE_URL = "https://openai.nexon.com/maplestory/v1";

const TARGET_ROOMS = [ "서브번호", "테스트" ];

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
        getWeatherFromNaver(msg, msgPart);
        break;

      default:
        break;

    }
  }
}

function getWeatherFromNaver(msg, msgPart)
{
  //전처리
  if(msgPart.length === 0)
  {
    msg.reply("사용법 : @날씨 [지역]");
    return;
  }
  //request
  var url = "https://m.search.naver.com/search.naver?query=" + msgPart + "%20날씨"
  var data = org.jsoup.Jsoup.connect(url)
      .header('Referer','https://m.search.naver.com')
      .get();
  
  var result = data.selectFirst('.select_txt').text().trim() + ' 날씨' + '\n'+
               data.selectFirst('.temperature_text').text().trim() + '\n'+
               data.selectFirst('.temperature_info > p').text().trim() +'\n';
  
  msg.reply(result);

}

/* API호출 */
function httpGet(msg, url) 
{
  try 
  {
    const connection = new java.net.URL(url).openConnection();
    connection.setRequestMethod("GET");
    connection.setRequestProperty("x-nexon-api-key", API_KEY);
    connection.setConnectTimeout(5000);
    connection.setReadTimeout(5000);

    const stream = new java.io.BufferedReader(
      new java.io.InputStreamReader(connection.getInputStream())
    );

    let result = "";
    let line;
    while ((line = stream.readLine()) !== null) {
      result += line;
    }
    stream.close();
    return result;
  } 
  catch (e) 
  {
    msg.reply("url호출 실패");
    return null;
  }
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