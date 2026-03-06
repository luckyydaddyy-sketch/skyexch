<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Casino;
use App\Models\CasinoBet;
use App\Models\DashboardImages;
use App\Models\FavMatch;
use App\Models\SportMatch;
use App\Models\User;
use App\Models\Website;
use App\Models\UserActivity;
use App\Models\UserStack;
use App\Traits\MatchTraits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class PageController extends Controller
{
    use MatchTraits;

    public function inPlay()
    {
        $response = [];
        $response['cricket_matches'] = SportMatch::where('match_type', 'cricket')->where('status',true)->pluck('game_id');
        $response['soccer_matches'] = SportMatch::where('match_type', 'soccer')->where('status',true)->pluck('game_id');
        $response['tennis_matches'] = SportMatch::where('match_type', 'tennis')->where('status',true)->pluck('game_id');

        $resp = $this->getMatches('cricket');
        $result = json_decode($resp->getContent());
        $response['cricket_list'] = $result->data;

        $resp = $this->getMatches('soccer');
        $result = json_decode($resp->getContent());
        $response['soccer_list'] = $result->data;

        $resp = $this->getMatches('tennis');
        $result = json_decode($resp->getContent());
        $response['tennis_list'] = $result->data;

        $favMatches = [];
        if (auth()->guard('web')->check()) {

            $user_id = auth()->guard('web')->user()->id;
            $favMatches = SportMatch::whereIn('id', function ($query) use ($user_id) {
                $query->select('match_id')
                    ->from(with(new FavMatch)->getTable())
                    ->where('user_id', $user_id);
            })->pluck('game_id');

            $favMatches = $favMatches->toArray();
        }

        return view('frontend.in-play',compact('favMatches','response'));
    }

    public function multiMarkets()
    {

        if (auth()->guard('web')->check()) {
            $user_id = auth()->guard('web')->user()->id;
            $cricket = SportMatch::whereIn('id', function ($query) use ($user_id) {
                $query->select('match_id')
                    ->from(with(new FavMatch)->getTable())
                    ->where('user_id', $user_id);
            })->where('match_type', 'cricket')->whereNull('winner')->get();
            $soccer = SportMatch::whereIn('id', function ($query) use ($user_id) {
                $query->select('match_id')
                    ->from(with(new FavMatch)->getTable())
                    ->where('user_id', $user_id);
            })->where('match_type', 'soccer')->whereNull('winner')->get();
            $tennis = SportMatch::whereIn('id', function ($query) use ($user_id) {
                $query->select('match_id')
                    ->from(with(new FavMatch)->getTable())
                    ->where('user_id', $user_id);
            })->where('match_type', 'tennis')->whereNull('winner')->get();
            return view('frontend.multi-markets',compact('tennis','soccer','cricket'));
        }else{
            return view('frontend.multi-markets');
        }
    }

    public function match($match_type)
    {

        $matches = SportMatch::where('match_type', $match_type)->where('status',true)->whereNull('winner')->pluck('game_id');

        $resp = $this->getMatches($match_type);
        $result = json_decode($resp->getContent());
        $list = $result->data;

            //        $list = [];

        $favMatches = [];
        if (auth()->guard('web')->check()) {

            $user_id = auth()->guard('web')->user()->id;
            $favMatches = SportMatch::whereIn('id', function ($query) use ($user_id) {
                $query->select('match_id')
                    ->from(with(new FavMatch)->getTable())
                    ->where('user_id', $user_id);
            })->pluck('game_id');

            $favMatches = $favMatches->toArray();
        }

        return view('frontend.match-list', compact('match_type', 'matches', 'list','favMatches'));
    }

    public function getMatchesList($matchType)
    {
        if (!auth()->guard('web')->check()) {
            return response()->json(['type' => 'error', 'message' => 'Login Required']);
        }
        return $this->getMatches($matchType);
    }

    public function getMatchDetailData($gameId,$marketId)
    {
        if (!auth()->guard('web')->check()) {
            return response()->json(['type' => 'error', 'message' => 'Login Required']);
        }

        return $this->getMatchDetail($gameId,$marketId);
                //        $result = json_decode($resp->getContent());
                //        $apiData = $result->data;
                //
                //        $apiData->t4 = [];
                //        $respPremium = $this->getMatchPremiumDetail($gameId,$marketId);
                //        $resultPremium = json_decode($respPremium->getContent());
                //        if(!empty($resultPremium->data) && isset($resultPremium->data->t4)) {
                //            $apiData->t4 = $resultPremium->data->t4;
                //        }

        return response()->json(['type' => 'success', 'message' => 'Success','data'=>$apiData]);
    }

    public function getMatchDetailPremiumData($gameId,$marketId)
    {
        if (!auth()->guard('web')->check()) {
            return response()->json(['type' => 'error', 'message' => 'Login Required']);
        }

        $apiData = [];
        $respPremium = $this->getMatchPremiumDetail($gameId,$marketId);
        $resultPremium = json_decode($respPremium->getContent());
        if(!empty($resultPremium->data) && isset($resultPremium->data)) {
            $apiData = $resultPremium->data;
        }

        return response()->json(['type' => 'success', 'message' => 'Success','data'=>$apiData]);
    }

    public function matchDetail($gameId,$marketId){

        $match = SportMatch::where("game_id",trim($gameId))->whereNull('winner')->first();

        if(empty($match) || (isset($match) && $match->status!=true)){
            return redirect()->route('frontend.home')->with('error','Invalid match trying to open!!');
        }

        $resp = $this->getMatchDetail($gameId,$marketId,$match->match_type);
        $result = json_decode($resp->getContent());
        $apiData = $result->data;
        if(!empty($apiData)) {
            $apiData->t4 = [];
        }
        if($match->premium) {
            $respPremium = $this->getMatchPremiumDetail($gameId, $marketId);
            $resultPremium = json_decode($respPremium->getContent());
            if (!empty($resultPremium->data) && isset($resultPremium->data->t4)) {
                if(!empty($apiData)) {
                    $apiData->t4 = $resultPremium->data->t4;
                }else{
                    $apiData['t4'] = $resultPremium->data->t4;
                }
            }
        }

        $stack = json_encode([]);
        if (auth()->guard('web')->check()) {
            $user = auth()->guard('web')->user();
            $stack = UserStack::where("user_id",$user->id)->first();
        }
        $isFav = 0;
        $betsValues = [];
        if (auth()->guard('web')->check()) {
            $user = auth()->guard('web')->user();
            $oddsBookmakerExposerArr = $this->getOddsAndBookmakerExposer($user->id, $match->id);
            $sessionExposerArr = $this->getUserAllMatchFancyExposer($user->id, $match->id);

            if(isset($oddsBookmakerExposerArr['ODDS'])){
                $betsValues['ODDS'] = $oddsBookmakerExposerArr['ODDS'];
            }
            if(isset($oddsBookmakerExposerArr['BOOKMAKER'])){
                $betsValues['BOOKMAKER'] = $oddsBookmakerExposerArr['BOOKMAKER'];
            }
            if(isset($oddsBookmakerExposerArr['PREMIUM'])){
                $betsValues['PREMIUM'] = $oddsBookmakerExposerArr['PREMIUM'];
            }
            if(!empty($sessionExposerArr)){
                $betsValues['SESSION'] = $sessionExposerArr;
            }

            $isFav = FavMatch::where("user_id",$user->id)->where('match_id',$match->id)->count();
        }

        $inPlay = false;
        if(!empty($apiData) && isset($apiData->t1)){
            if(isset($apiData->t1[0]->inPlay) && $apiData->t1[0]->inPlay == true){
                $inPlay = true;
            }

            if(isset($apiData->t1[0]) && strtotime($apiData->t1[0]->openDate) <= strtotime(date('Y-m-d H:i'))){
                $inPlay = true;
            }
        }

        $odds_unsuspend = [];
        if(!empty(env('ODDS_UNSUSPEND'))){
            $odds_unsuspend = explode(",",env('ODDS_UNSUSPEND'));
        }

        return view('frontend.match-detail',compact('match','apiData','stack','betsValues','inPlay','isFav','odds_unsuspend'));
    }

    public function casino(){

        if(env('SEXY_CASINO_ENABLE',true) == false){
            return response()->json(['error' => 'Invalid request trying to open!!']);
        }

        if(!auth()->guard('web')->check()){
            return response()->json(['error' => 'Invalid request trying to open!!']);
        }

        $user = auth()->guard('web')->user();
        $website = resolve('website');
        $domainArray = Website::getWebsiteUniqueNamees();
        $flipped = array_flip($domainArray);
        $prefix = "";
        if(isset($flipped[$website->domain])){
            $prefix =  $flipped[$website->domain];
        }

        $betLimitArray = [
            "SEXYBCRT" => [
                "LIVE" => [
                    "limitId" => [260701,260702,260703,260704,260705]
                ]
            ],
            "SV388" => [
                "LIVE" => [
                    "maxbet" => 500,
                    "minbet" => 1,
                    "mindraw" => 1,
                    "matchlimit" => 1000,
                    "maxdraw" => 500,
                ]
            ],
            "HORSEBOOK" => [
                "LIVE" => [
                    "minbet" => 1,
                    "maxbet" => 500,
                    "maxBetSumPerHorse" => 1000,
                    "minorMinbet" => 1,
                    "minorMaxbet" => 100,
                    "minorMaxBetSumPerHorse" => 500,
                ]
            ]
        ];

        if ($user->awc_api_user_created == false) {
            $response = $this->callAWCApi('/wallet/createMember', "POST", [
                'cert' => 'bReskYqWQYQcIE4T9uH',
                'agentId' => '7wicketslive',
                'userId' => $prefix.$user->user_name,
                'userName' => $user->user_name,
                'currency' => 'USD',
                'betLimit' => json_encode($betLimitArray),
                'language' => 'en',
            ]);

            if ($response['status'] == '0000') {
                User::where("id", $user->id)->update(['awc_api_user_created' => true]);
            } else {
                \Log::info(json_encode($response));
                return response()->json(['error' => $response['desc']]);
            }
        }

        $loginResponse = $this->callAWCApi('/wallet/login', "POST", [
            "cert" => "bReskYqWQYQcIE4T9uH",
            "agentId" => "7wicketslive",
            "userId" => $prefix.$user->user_name,
            "isMobileLogin" => true,
            "externalURL" => url('/'),
            "gameForbidden" => json_encode([
                "JDBFISH" => [
                    "FH" => ["ALL"]
                ]
            ]),
            "gameType" => "",
            "platform" => "",
            "language" => "en",
            'betLimit' => json_encode($betLimitArray),
            "autoBetMode" => "1"
        ]);

        if($loginResponse['status'] == "0000"){
            return response()->json(['url'=>$loginResponse['url']]);
        }else{
            return response()->json(['error' => $loginResponse['desc']]);
        }

        //        $casinos = Casino::where("status",true)->get();
        //        return view('frontend.casino',compact('casinos'));
    }

    public function casinoNew(Request $request){
        try {
            if (env('SEXY_CASINO_ENABLE', true) == false) {
                return response()->json(['error' => 'Invalid request trying to open!!']);
            }

            if (!auth()->guard('web')->check()) {
                return response()->json(['error' => 'Invalid request trying to open!!']);
            }

            $user = auth()->guard('web')->user();
            $website = resolve('website');
            $domainArray = Website::getWebsiteUniqueNamees();
            $flipped = array_flip($domainArray);
            $prefix = "";
            if (isset($flipped[$website->domain])) {
                $prefix = $flipped[$website->domain];
            }

            $betLimitArray = [
                "SEXYBCRT" => [
                    "LIVE" => [
                        "limitId" => [140101]
                    ]
                ],
                "VENUS" => [
                    "LIVE" => [
                        "limitId" => [140101]
                    ]
                ]
            ];

            if ($user->awc_api_user_created == false) {
                $response = $this->callAWCApi('/wallet/createMember', "POST", [
                    'cert' => 'sOWhwqXefriKYg0Z1sO',
                    'agentId' => 'galaxy365',
                    'userId' => $prefix . $user->user_name,
                    'userName' => $user->user_name,
                    'currency' => 'MYR',
                    'betLimit' => json_encode($betLimitArray),
                    'language' => 'en',
                ]);

                if ($response['status'] == '0000') {
                    User::where("id", $user->id)->update(['awc_api_user_created' => true]);
                } else {
                    return response()->json(['error' => $response['desc']]);
                }
            }

            $img_data = \DB::table('awc_casino_img_list')->where('img_id', $request->imgid)->first();
            if(!$img_data) {
                return response()->json(['error' => 'Image id not valid!!']);
            }

            $loginResponse = $this->callAWCApi('/wallet/doLoginAndLaunchGame', "POST", [
                "cert" => "sOWhwqXefriKYg0Z1sO",
                "agentId" => "galaxy365",
                "userId" => $prefix . $user->user_name,
                "gameCode" => $img_data->game_code,
                "gameType" => $img_data->game_type,
                "platform" => $img_data->platform,
                "isMobileLogin" => true,
                "externalURL" => url('/'),
                "language" => "en",
                "hall" => $img_data->hall,
                "betLimit" => $img_data->bet_limit,
                "autoBetMode" => "1",
                "enableTable" => true,
                "tid" => "1",
                // "gameForbidden" => json_encode([
                //     "JDBFISH" => [
                //         "FH" => ["ALL"]
                //     ]
                // ]),
            ]);

            if ($loginResponse['status'] == "0000") {
                return response()->json(['url' => $loginResponse['url']]);
            } else {
                return response()->json(['error' => $loginResponse['desc']]);
            }
        } catch(\Exception $e) {
            \Log::info($e->getMessage());
            \Log::info($e->getTrace());
        }
        //        $casinos = Casino::where("status",true)->get();
        //        return view('frontend.casino',compact('casinos'));
    }

    public function liveCasino(){

        if(env('DIAMOND_CASINO_ENABLE',true) == false){
            return redirect()->route('frontend.home')->with('error','Invalid request trying to open!!');
        }

        if(!auth()->guard('web')->check()){
            return redirect()->route('frontend.home')->with('error','Invalid request trying to open!!');
        }

        $casinos = Casino::where("status",true)->where("type","dimond")->get();
        return view('frontend.live-casino',compact('casinos'));
    }

    public function liveCasinoDetail($name){

        if(!auth()->guard('web')->check()){
            return redirect()->route('frontend.home')->with('error','Invalid request trying to open!!');
        }

        $casino = Casino::where("status",true)->where('name',$name)->where('type','dimond')->first();

        $resp = $this->getCasinoDetailDataFromApi($name);
        $result = json_decode($resp->getContent());

        $apiData = [];
        if(!empty($result->data) && isset($result->data)) {
            $apiData['data'] = $result->data;
            $apiData['results'] = $result->results;
        }

        //        dd($apiData);

        $stack = json_encode([]);
        if (auth()->guard('web')->check()) {
            $user = auth()->guard('web')->user();
            $stack = UserStack::where("user_id",$user->id)->first();
        }

        $betsValues = [];
        $betHtml = '';
        if (auth()->guard('web')->check()) {
            $user = auth()->guard('web')->user();
            $casinoExposer = $this->getCasinoExAmount($user->id, $casino->id,'');
            if(isset($casinoExposer['ODDS'])) {
                $betsValues['ODDS'] = $casinoExposer['ODDS'];

                $backBets = CasinoBet::where("user_id",$user->id)->where('bet_side',"BACK")->where('casino_id',$casino->id)->where('deleted',0)->whereNull('winner')->orderBy('id', 'DESC')->get();
                $layBets = CasinoBet::where("user_id",$user->id)->where('bet_side',"LAY")->where('casino_id',$casino->id)->where('deleted',0)->whereNull('winner')->orderBy('id', 'DESC')->get();

                $betHtml = view('frontend.ajax.casino-bet-list',compact('backBets','layBets'))->render();
            }
        }

        return view('frontend.live-casino-detail',compact('casino','apiData','stack','betsValues','betHtml'));
    }

    public function getCasinoDetailData($name){
        return $this->getCasinoDetailDataFromApi($name);
    }
    public function casinoDetail($name){
        if(!auth()->guard('web')->check()){
            return redirect()->route('frontend.home')->with('error','Invalid request trying to open!!');
        }

        $casino = Casino::where("status",true)->where('name',$name)->where('type','sky')->first();

        $stack = json_encode([
            'stack1'=> 10, 'stack2' => 20, 'stack3'=> 50, 'stack4'=> 100, 'stack5'=> 200, 'stack6'=> 300
        ]);
        if (auth()->guard('web')->check()) {
            $user = auth()->guard('web')->user();
            $stack = UserStack::where("user_id",$user->id)->first();
        }

        $cards = Casino::getCardsClass();

        return view('frontend.casino-detail',compact('casino','stack','cards'));
    }

    public function getSkyCasinoDetailData($name){
        $resp = $this->getSkyCasinoData($name);

        $result = json_decode($resp->getContent());

        $apiData = [
            'type' => $result->type
        ];
        if(!empty($result->data) && isset($result->data)) {
            $apiData['data'] = $result->data;
        }

        $available_balance = 0;
        if (auth()->guard('web')->check()) {
            $user = User::where("id",auth()->guard('web')->user()->id)->first();
            $available_balance = $user->available_balance;
        }

        $apiData['available_balance'] = $available_balance;

        return $apiData;
    }

    public function getSkyCasinoDetailDataResults($name,$roundId){
        return $this->getSkyCasinoResultsData($name,$roundId);
    }
}
