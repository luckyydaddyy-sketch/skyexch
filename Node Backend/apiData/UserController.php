<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Bet;
use App\Models\Casino;
use App\Models\CasinoBet;
use App\Models\DashboardImages;
use App\Models\FavMatch;
use App\Models\SportMatch;
use App\Models\User;
use App\Models\UserAccount;
use App\Models\UserActivity;
use App\Models\UserStack;
use App\Traits\MatchTraits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{

    use MatchTraits;

    public function favMatch($gameId){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $match = SportMatch::where('game_id',$gameId)->first();
        if(empty($match)){
            return response()->json(['type'=>'error','message'=>'Invalid match game id']);
        }

        $user = auth()->guard('web')->user();

        if(FavMatch::where("user_id",$user->id)->where("match_id",$match->id)->count() > 0){
            FavMatch::where("user_id",$user->id)->where("match_id",$match->id)->delete();

            return response()->json(['type'=>'success','message'=>'Mach Remove from favorite','result'=>'remove']);
        }

        FavMatch::create([
            'user_id' => $user->id,
            'match_id' => $match->id
        ]);

        return response()->json(['type'=>'success','message'=>'Mach added to your favorite','result'=>'added']);
    }

    public function getFavMatch($matchType){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }
        $user_id = auth()->guard('web')->user()->id;
        $matches = SportMatch::whereIn('id', function ($query) use ($user_id) {
            $query->select('match_id')
                ->from(with(new FavMatch)->getTable())
                ->where('user_id', $user_id);
            })->where('match_type',$matchType)->get();

        return response()->json(['type'=>'success','message'=>'Mach added to your favorite','data'=>$matches]);
    }

    public function myAccount($type){
        if (!auth()->guard('web')->check()) {
            return redirect()->route('frontend.home')->with('error','Login Required');
        }
        $user = auth()->guard('web')->user();
        if(!empty($user)) {
            if($type == 'profile'){
                $page = 'profile';
            }elseif(!empty($type) && $type == 'account-statement'){
                $page = 'account-statement';
            }elseif(!empty($type) && $type == 'activity-log'){
                $page = 'activity-log';
            }elseif(!empty($type) && ($type == 'bet' || $type == 'bet-history')){
                $page = 'bet';
            }else{
                return redirect()->route('frontend.home')->with('error','Unauthorised url you are trying to open.');
            }
            return view('frontend.profile.index',compact('user','page','type'));
        }

        return redirect()->route('frontend.home')->with('error','Unauthorised url you are trying to open.');
    }

    public function userMyAccount(){
        if (!auth()->guard('web')->check()) {
            return redirect()->route('frontend.home')->with('error','Login Required');
        }

        $user = auth()->guard('web')->user();
        return view('frontend.profile.my-account',compact('user'));
    }

    public function accountStatementData(Request $request){

        if (!auth()->guard('web')->check()) {
            return redirect()->route('frontend.home')->with('error','Login Required');
        }

        $user_id = auth()->guard('web')->user()->id;

        if ($request->from_date) {
            $from_date = date('Y-m-d', strtotime(trim($request->from_date)));
        }
        if ($request->to_date) {
            $to_date = date('Y-m-d', strtotime($request->to_date));
        }
        if ($request->from_date == $request->to_date) {
            $from_date = date('Y-m-d', strtotime($request->from_date));
            $to_date = date('Y-m-d', strtotime($request->to_date . "+1 day"));
        }

        $response = $this->getAccountStatementData($user_id, $from_date, $to_date, $request->report_for, $request->report_type);

        $html = view('account-statement-data',compact('response'))->render();

        return response()->json(['type'=>'success','message'=>'Data retrieved','html'=>$html]);
    }

    public function changePassword($id, Request $request){

        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = auth()->guard('web')->user();

        $validator = Validator::make($request->all(), [
            'new_password' => 'required|min:6',
            'confirm_password' => 'required|min:6',
            'password' => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return response()->json(['type'=>'error','message'=>$validator->errors()->first()]);
        }

        if($request->new_password != $request->confirm_password){
            return response()->json(['type'=>'error','message'=>"Password and confirm password does not match!"]);
        }

        if(Hash::check($request->password,$user->password)) {
            $user->password = $request->new_password;
            $user->save();

            UserActivity::create([
                'user_id' => $id,
                'action' => 'Password Updated',
                'ip_address' => $_SERVER['REMOTE_ADDR'],
                'browser_detail' => $_SERVER['HTTP_USER_AGENT'],
                'data' => ''
            ]);

            return response()->json(['type' => 'success', 'message' => "Password updated successfully!"]);
        }else{
            return response()->json(['type'=>'error','message'=>"Invalid Password!"]);
        }
    }

    public function Stack(Request $request){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = auth()->guard('web')->user();

        $validator = Validator::make($request->all(), [
            'default_stack' => 'required',
            'stack1' => 'required',
            'stack2' => 'required',
            'stack3' => 'required',
            'stack4' => 'required',
            'stack5' => 'required',
            'stack6' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['type'=>'error','message'=>$validator->errors()->first()]);
        }


        $stack = UserStack::where("user_id",$user->id)->first();
        if(empty($stack)){
            $stack = new UserStack();
        }

        $stack->user_id = $user->id;
        $stack->default_stack = $request->default_stack;
        $stack->stack1 = $request->stack1;
        $stack->stack2 = $request->stack2;
        $stack->stack3 = $request->stack3;
        $stack->stack4 = $request->stack4;
        $stack->stack5 = $request->stack5;
        $stack->stack6 = $request->stack6;
        $stack->highlights_odds_change = isset($request->highlights_odds_change) && $request->highlights_odds_change == 'on' ? true:false;
        $stack->accept_any_fancy_odds = isset($request->accept_any_fancy_odds) && $request->accept_any_fancy_odds == 'on' ? true:false;
        $stack->accept_any_bookmaker_odds = isset($request->accept_any_bookmaker_odds) && $request->accept_any_bookmaker_odds == 'on' ? true:false;
        $stack->save();

        return response()->json(['type' => 'success', 'message' => "Stack updated successfully!"]);
    }

    public function getMatchListAndCountData($match_type, $call){
        $matches = SportMatch::where('match_type', $match_type)->whereNull('winner')->pluck('game_id')->toArray();

        $resp = $this->getMatches($match_type);
        $result = json_decode($resp->getContent());

        $response[$match_type] = [
            'count' => 0,
            'html' => '',
        ];

        $html = '';
        foreach ($result->data as $item){
            if(in_array($item->gameId,$matches)) {
                if ($item->inPlay == true) {
                    $response[$match_type]['count']++;
                }
                if ($call == 1) {
                    $html .= '<li><a href="' . route('frontend.match.detail', [$item->gameId, $item->marketId]) . '" class="text-color-black2">' . $item->eventName . '</a></li>';
                }
            }
        }

        $response[$match_type]['html'] = $html;

        return $response;
    }

    public function matchesInPlayCount($call){

        $data_from = resolve('data_from');

        $response = [];
        if($data_from == 'api') {
            $response = $this->getMatchListAndCountData('cricket', $call);
            $response1 = $this->getMatchListAndCountData('soccer', $call);
            $response = array_merge($response, $response1);
            $response2 = $this->getMatchListAndCountData('tennis', $call);
            $response = array_merge($response, $response2);
        }

        $userBalance = [];
        $multiLoginHappen = false;
        if (auth()->guard('web')->check()) {
            $user = User::find(auth()->guard('web')->user()->id);

            $newUser =  User::select("id","session_id")->where("id",$user->id)->first();

            if($newUser->session_id != Session::get('session_id')) {
                $multiLoginHappen = true;
            }

            $userBalance = [
                'exposer' => number_format($user->exposer, 2, '.', ''),
                'available_balance' => number_format($user->available_balance, 2, '.', ''),
            ];
        }


        return response()->json(['type'=>'success','message'=>'Data retrieved','data'=>$response,'userBalance'=>$userBalance,'multiLoginHappen'=>$multiLoginHappen]);
    }

    public function getCurrentOddsFromApi($match_type, $game_id, $market_id, $selection_sid, $selection_position, $bet_type, $bet_side, $odds, $premium_market_id=''){
        if(in_array($bet_type, ['ODDS','BOOKMAKER','SESSION'])) {
            $resp = $this->getMatchDetail($game_id, $market_id);
            $result = json_decode($resp->getContent());
            $apiData = $result->data;

            $odds_unsuspend = [];
            if(!empty(env('ODDS_UNSUSPEND'))){
                $odds_unsuspend = explode(",",env('ODDS_UNSUSPEND'));
            }

            if ($bet_type == 'ODDS') {
                if (isset($apiData->t1) && count($apiData->t1) > 0) {
                    foreach ($apiData->t1 as $team) {

                        if ($team->sId == $selection_sid) {
                            $currentOdds = $team->$selection_position;
                            if (!in_array($team->status, ['ACTIVE', 'OPEN']) && !in_array($match_type,$odds_unsuspend)) {
                                return ['odds' => $currentOdds, 'status' => false];
                            } else {
                                if ($bet_side == 'LAY') {
                                    if ($odds >= $currentOdds) {
                                        return ['odds' => $currentOdds, 'status' => true];
                                    } else {
                                        return ['odds' => $currentOdds, 'status' => false];
                                    }
                                } else {
                                    if ($odds <= $currentOdds) {
                                        return ['odds' => $currentOdds, 'status' => true];
                                    } else {
                                        return ['odds' => $currentOdds, 'status' => false];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            elseif ($bet_type == 'BOOKMAKER') {
                if (isset($apiData->t2) && count($apiData->t2) > 0) {
                    foreach ($apiData->t2 as $team) {
                        if ($team->sId == $selection_sid) {
                            if (!in_array($team->status, ['ACTIVE', 'OPEN'])) {
                                return ['odds' => $odds, 'status' => false];
                            } else {
                                $currentOdds = $team->$selection_position;
                                if ($odds == $currentOdds) {
                                    return ['odds' => $currentOdds, 'status' => true];
                                } else {
                                    return ['odds' => $currentOdds, 'status' => false];
                                }
                            }
                        }
                    }
                }
            }
            elseif ($bet_type == 'SESSION') {

                if (isset($apiData->t3) && count($apiData->t3) > 0) {
                    foreach ($apiData->t3 as $team) {
                        if ($team->sId == $selection_sid) {
                            if (!in_array($team->status, ['ACTIVE', 'OPEN'])) {
                                return ['odds' => $odds, 'status' => false];
                            } else {
                                $currentOdds = $team->$selection_position;
                                if ($odds == $currentOdds) {
                                    return ['odds' => $currentOdds, 'status' => true];
                                } else {
                                    return ['odds' => $currentOdds, 'status' => false];
                                }
                            }
                        }
                    }
                }
            }

        }
        elseif ($bet_type == 'PREMIUM'){
            $resp = $this->getMatchPremiumDetail($game_id, $market_id);
            $result = json_decode($resp->getContent());
            $apiData = $result->data;

            //            dd($apiData);

            foreach($apiData->t4 as $market){
                if($market->id == $premium_market_id){
                    //                    dd($market->sub_sb, $selection_sid);
                    foreach ($market->sub_sb as $item){
                        if($item->sId == $selection_sid){
                            if($item->$selection_position == $odds){
                                return ['odds'=>$odds,'status'=>true];
                            }else{
                                return ['odds'=>$odds,'status'=>false];
                            }
                        }
                    }
                }
            }
        }

        return ['odds'=>$odds,'status'=>false];
    }

    public function placeBet(Request $request){

        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = User::find(auth()->guard('web')->user()->id);
        if ($user->remaining_balance <= 0) {
            return response()->json(['type'=>'error','message'=>'Insufficient Balance!']);
        }
        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        if ($request->bet_type == 'ODDS' && $request->odds <= 0.4) {
            return response()->json(['type'=>'error','message'=>'Invalid odds value']);
        }

        if($request->odds <= 0){
            return response()->json(['type'=>'error','message'=>'Invalid odds value']);
        }

        $match = SportMatch::where(['id' => $request->match_id])->whereNull('winner')->first();
        if(empty($match)){
            return response()->json(['type'=>'error','message'=>'Invalid Match']);
        }

        $parents = User::getAllParents($user->id);
        $delayTimeInSeconds = 0;
        if ($request->bet_type === 'ODDS') {
            if ($match->suspend_odds) {
                return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
            }

            if($match->match_type == 'cricket') {
                $delayTimeUser = User::whereIn('id', $parents)->where("odds", '>', 0)->first();
                if(!empty($delayTimeUser)) {
                    $delayTimeInSeconds = $delayTimeUser->odds;
                }
            }elseif($match->match_type == 'soccer') {
                $delayTimeUser = User::whereIn('id', $parents)->where("soccer", '>', 0)->first();
                if(!empty($delayTimeUser)) {
                    $delayTimeInSeconds = $delayTimeUser->soccer;
                }
            }elseif($match->match_type == 'tennis') {
                $delayTimeUser = User::whereIn('id', $parents)->where("tennis", '>', 0)->first();
                if(!empty($delayTimeUser)) {
                    $delayTimeInSeconds = $delayTimeUser->tennis;
                }
            }
        }

        if ($request->bet_type === 'BOOKMAKER') {
            if ($match->bookmaker == 0) {
                return response()->json(['type'=>'error','message'=>'Bookmaker is disabled by admin!']);
            }
            if ($match->suspend_bookmaker) {
                return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
            }

            $delayTimeUser = User::whereIn('id',$parents)->where("bookmaker",'>',0)->first();
            if(!empty($delayTimeUser)) {
                $delayTimeInSeconds = $delayTimeUser->bookmaker;
            }
        }

        if ($request->bet_type === 'SESSION') {
            if ($match->fancy == 0) {
                return response()->json(['type'=>'error','message'=>'SESSION is disabled by admin!']);
            }

            if ($match->suspend_fancy) {
                return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
            }
            $delayTimeUser = User::whereIn('id',$parents)->where("fancy",'>',0)->first();
            if(!empty($delayTimeUser)) {
                $delayTimeInSeconds = $delayTimeUser->fancy;
            }
        }

        if ($request->bet_type === 'PREMIUM') {
            if ($match->premium == 0) {
                return response()->json(['type'=>'error','message'=>'Premium is disabled by admin!']);
            }
            if ($match->suspend_premium) {
                return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
            }
            $delayTimeUser = User::whereIn('id',$parents)->where("premium",'>',0)->first();
            if(!empty($delayTimeUser)) {
                $delayTimeInSeconds = $delayTimeUser->premium;
            }
        }

        if ($request->bet_type === 'ODDS') {
            if ($request->amount < $match->min_bet_odds_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->min_bet_odds_limit . '!']);
            }
            if ($request->amount > $match->max_bet_odds_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->max_bet_odds_limit . '!']);
            }
        }
        if ($request->bet_type === 'BOOKMAKER') {
            if ($request->amount < $match->min_bet_bookmaker_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->min_bet_bookmaker_limit . '!']);
            }
            if ($request->amount > $match->max_bet_bookmaker_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->max_bet_bookmaker_limit . '!']);
            }
        }
        if ($request->bet_type == 'SESSION') {
            if ($request->amount < $match->min_bet_fancy_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->min_bet_fancy_limit . '!']);
            }
            if ($request->amount > $match->max_bet_fancy_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->max_bet_fancy_limit . '!']);
            }
        }
        if ($request->bet_type == 'PREMIUM') {
            if ($request->amount < $match->min_bet_premium_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->min_bet_premium_limit . '!']);
            }
            if ($request->amount > $match->max_bet_premium_limit) {
                return response()->json(['type'=>'error','message'=>'Minimum bet limit is ' . $match->max_bet_premium_limit . '!']);
            }
        }

        if (($request->odds > $match->odds_limit) && $request->bet_type === 'ODDS') {
            return response()->json(['type'=>'error','message'=>'Odds Limit Exceed!']);
        }

            //        if($request->bet_type === 'SESSION'){
            //            $odds = $request->odds_volume;
            //        }else {

            //        }
        $odds = $request->odds;
        $stack = $request->amount;
        $oddMatchResponse = $this->getCurrentOddsFromApi($match->match_type, $match->game_id, $match->market_id, $request->selection_sid, $request->selection_position, $request->bet_type, $request->bet_side, $odds, $request->market_id);

        if($oddMatchResponse['status'] == false){
            return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
        }else{
            $odds = $oddMatchResponse['odds'];
        }

        if ($request->bet_type === 'ODDS') {
            if ($request->bet_side === 'LAY') {
                $profit = round($stack, 2);
                $exposer = ((($odds - 1) * $stack));
            } else {
                $exposer = $stack;
                $profit = ((($odds - 1) * $stack));
            }
        }
        if ($request->bet_type === 'BOOKMAKER') {
            if($match->match_type == 'cricket') {
                if ($request->bet_side === 'LAY') {
                    $profit = round($stack, 2);
                    $exposer = (($odds * $stack) / 100);
                } else {
                    $exposer = $stack;
                    $profit = round(($odds * $stack) / 100, 2);
                }
            }else{
                if ($request->bet_side === 'LAY') {
                    $profit = round($stack, 2);
                    $exposer = ((($odds - 1) * $stack));
                } else {
                    $exposer = $stack;
                    $profit = ((($odds - 1) * $stack));
                }
            }
        }
        if ($request->bet_type === 'SESSION') {
            if ($request->bet_side === 'LAY') {
                $profit = round($stack, 2);
                $exposer = ((($request->odds_volume) * $stack)) / 100;
            } else {
                $profit = round(($request->odds_volume * $stack) / 100, 2);
                $exposer = $stack;
            }
        }
        if($request->bet_type == 'PREMIUM'){
            if ($request->bet_side === 'LAY') {
                $profit = round($stack, 2);
                $exposer = ((($odds - 1) * $stack));
            } else {
                $exposer = $stack;
                $profit = ((($odds - 1) * $stack));
            }
        }

        $extra = '';
        if($request->has('extra')){
            $extra = json_encode($request->extra);
        }

        if (in_array($request->bet_type,['ODDS','BOOKMAKER','PREMIUM'])) {
            $betRecord = [];
            $betRecord['match_id'] =  "!=";
            $betRecord['bet_type'] = $request->bet_type;
            $betRecord['bet_side'] = $request->bet_side;
            $betRecord['selection'] = $request->selection;
            $betRecord['exposer'] = $exposer;
            $betRecord['amount'] = $request->amount;
            if($request->has('market_name')) {
                $betRecord['market_name'] = $request->market_name;
            }
            if($request->has('market_id')) {
                $betRecord['market_id'] = $request->market_id;
            }
            $betRecord['profit'] = $profit;
            $betRecord['extra'] = $extra;

            $oddsBookmakerExposerArr = $this->getOddsAndBookmakerExposer($user->id, $match->id, $betRecord);
            $oddsExposer = $oddsBookmakerExposerArr['exposer'];

            //            dd($oddsBookmakerExposerArr);
        }
        else{
            $oddsBookmakerExposerArr = $this->getOddsAndBookmakerExposer($user->id);
            $oddsExposer = $oddsBookmakerExposerArr['exposer'];
        }

        $fancyExposer = 0;
        if ($request->bet_type == 'SESSION'){
            $betRecord = [];
            $betRecord['exposer'] = $exposer;
            $betRecord['odds'] = $request->odds;
            $betRecord['odds_volume'] = $request->odds_volume;
            $betRecord['bet_side'] = $request->bet_side;

            $otherSessionExposer = $this->getAllSessionExposure($user->id,$match->id,'',['match_id'=>'!=']);
            $otherCurrentSessionExposer = $this->getAllSessionExposure($user->id,$match->id,$request->selection,['selection'=>'!=']);
            $currentSessionExposer = $this->getAllSessionExposure($user->id,$match->id,$request->selection, $betRecord);
            $sessionExposer = $otherSessionExposer + $otherCurrentSessionExposer + $currentSessionExposer;

            $fancyExposer = $currentSessionExposer;

            //            dd($otherSessionExposer, $otherCurrentSessionExposer, $currentSessionExposer);
        }else{
            $fancyExposer = 0;
            $sessionExposer = $this->getAllSessionExposure($user->id);
        }

        $casinoExposer = $this->getCasinoExAmount($user->id, '','');

        $awcCasinoExposer = $this->getAwcCasinoExAmount($user->id);

        $allExposerArray = [$sessionExposer, $oddsExposer, $casinoExposer, $awcCasinoExposer];
        $finalExposerWithCurrentMatchSession = array_sum($allExposerArray);
        if ($user->remaining_balance < $finalExposerWithCurrentMatchSession) {
            return response()->json(['type'=>'error','message'=>'Insufficient Balance!!']);
        }

        if ($request->bet_type == 'ODDS' || $request->bet_type == 'BOOKMAKER'){
            SportMatch::where("id",$match->id)->update([
                'teams' => json_decode($extra,true)
            ]);
        }

        sleep($delayTimeInSeconds);

        $oddMatchResponse = $this->getCurrentOddsFromApi($match->match_type, $match->game_id, $match->market_id, $request->selection_sid, $request->selection_position, $request->bet_type, $request->bet_side, $request->odds, $request->market_id);

        if($oddMatchResponse['status'] == false){
            return response()->json(['type'=>'error','message'=>'Un-match Bet Total Not Allowed!']);
        }

        if (($odds < $match->min_odds_limit || $odds > $match->odds_limit) && $request->bet_type === 'ODDS') {
            return response()->json(['type'=>'error','message'=>'Odds Limit Exceed!']);
        }

        if($odds <= 0){
            return response()->json(['type'=>'error','message'=>'Invalid Odds!']);
        }

        $bet = New Bet();
        $bet->user_id = $user->id;
        $bet->match_id = $match->id;
        $bet->bet_type = $request->bet_type;
        $bet->bet_side = $request->bet_side;
        $bet->amount = $stack;
        $bet->odds = $odds;
        $bet->odds_volume = $request->odds_volume;
        $bet->selection = $request->selection;
        $bet->selection_sid = $request->selection_sid;
        $bet->selection_position = $request->selection_position;
        if($request->has('market_name')) {
            $bet->market_name = $request->market_name;
        }
        if($request->has('market_id') && $request->market_id!=null && !empty($request->market_id)) {
            $bet->market_id = $request->market_id;
        }else{
            $bet->market_id = 0;
        }
        if (!empty($extra)) {
            $bet->teams = $extra;
        }
        $bet->exposer = $exposer;
        $bet->profit = $profit;
        if($bet->save()){
            $resp = $this->SaveBalance($user->id);
            if($resp === false){
                $bet->delete();
                return response()->json(['type'=>'error','message'=>'Insufficient Balance!!!']);
            }
            $user = User::find($user->id);
            return response()->json(['type'=>'success','message'=>'Bet Placed Successfully.','data'=>[
                'exposer' => number_format($user->exposer, 2, '.', ''),
                'available_balance' => number_format($user->available_balance, 2, '.', ''),
                'fancy_exposer' => $fancyExposer
            ]]);
        }

        return response()->json(['type'=>'success','message'=>'Unable to place bet, please try after some time.']);
    }

    public function placeCasinoBet(Request $request){

        $casino = Casino::where("id",$request->casino_id)->first();
        if(empty($casino)){
            return response()->json(['status'=>false,'message'=>'Casino not found']);
        }

        if ($casino->min_bet_odds > $request->amount || $casino->max_bet_odds < $request->amount) {
            return response()->json(['status'=>false,'message'=>'Bet Not Confirm Reason Min and Max Bet Range Not Valid.']);
        }

        $user = User::find(auth()->guard('web')->user()->id);
        if ($user->remaining_balance <= 0) {
            return response()->json(['type'=>'error','message'=>'Insufficient Balance!']);
        }
        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        if($request->odds <= 0){
            return response()->json(['type'=>'error','message'=>'Invalid odds value']);
        }

        $odds = $request->odds;
        $stack = $request->amount;

        if($casino->type == 'sky'){
            $exposer = $stack;
            $profit = $stack;
        }else {
            if ($request->bet_side === 'LAY') {
                $profit = round($stack, 2);
                $exposer = ((($odds - 1) * $stack));
            } else {
                $exposer = $stack;
                $profit = ((($odds - 1) * $stack));
            }
        }

        $extra = '';
        if($request->has('extra')){
            $extra = json_encode($request->extra);
        }

        // odds and bookmaker exposer
        $oddsBookmakerExposerArr = $this->getOddsAndBookmakerExposer($user->id);
        $oddsExposer = $oddsBookmakerExposerArr['exposer'];

        // session exposer
        $sessionExposer = $this->getAllSessionExposure($user->id);

        // other casino exposer
        $otherCasinoExposerArray = $this->getCasinoExAmount($user->id, $casino->id,'',['casino_id'=>"!="]);
        $otherCasinoExposer = $otherCasinoExposerArray['exposer'];
        // current casino exposer
        $casinoExposer = $this->getCasinoExAmount($user->id, $casino->id,'');

        $awcCasinoExposer = $this->getAwcCasinoExAmount($user->id);

        //adding current bet to the existing current casino bets exposer calculation
        if($casino->type == 'sky'){
            $profitAmt = $profit;
            $bet_amt = ($stack * (-1));
        }else {
            if ($request->bet_side === 'LAY') {
                $profitAmt = ($exposer * (-1));
                $bet_amt = $stack;
            } else {
                $profitAmt = $profit;
                $bet_amt = ($stack * (-1));
            }
        }

        $teamsArray = $request->extra;
        foreach ($teamsArray as $team){
            if($team['sid'] == $request->selection_sid) {
                if (!isset($casinoExposer['ODDS'][$team['sid']])) {
                    $casinoExposer['ODDS'][$team['sid']] = round($profitAmt, 2);
                } else {
                    $casinoExposer['ODDS'][$team['sid']] += round($profitAmt, 2);
                }
            }else {
                if (!isset($casinoExposer['ODDS'][$team['sid']])) {
                    $casinoExposer['ODDS'][$team['sid']] = round($bet_amt, 2);
                } else {
                    $casinoExposer['ODDS'][$team['sid']] += round($bet_amt, 2);
                }
            }
        }

        $arr = [];
        $casinoExposer['exposer'] = 0;
        foreach ($casinoExposer['ODDS'] as $key => $profitLos) {
            if ($profitLos < 0) {
                $arr[abs($profitLos)] = abs($profitLos);
            }
        }
        if (is_array($arr) && count($arr) > 0) {
            $casinoExposer['exposer'] += max($arr);
        }

        $currentCasinoExposer = $casinoExposer['exposer'];

        //$finalExposerWithCurrentMatchSession = $sessionExposer + $oddsExposer + $otherCasinoExposer + $currentCasinoExposer + $awcCasinoExposer;

        $allExposerArray = [$sessionExposer, $oddsExposer, $otherCasinoExposer, $currentCasinoExposer, $awcCasinoExposer];
        $finalExposerWithCurrentMatchSession = array_sum($allExposerArray);

        if ($user->remaining_balance < $finalExposerWithCurrentMatchSession) {
            return response()->json(['type'=>'error','message'=>'Insufficient Balance!!']);
        }

        $bet = New CasinoBet();
        $bet->user_id = $user->id;
        $bet->casino_id = $casino->id;
        $bet->bet_type = $request->bet_type;
        $bet->bet_side = $request->bet_side;
        $bet->amount = $stack;
        $bet->odds = $odds;
        $bet->odds_volume = $request->odds_volume;
        $bet->selection = $request->selection;
        $bet->selection_sid = $request->selection_sid;
        $bet->selection_position = $request->selection_position;
        $bet->round_id = $request->round_id;
        if (!empty($extra)) {
            $bet->teams = $extra;
        }
        $bet->exposer = $exposer;
        $bet->profit = $profit;
        if($bet->save()){
            $resp = $this->SaveBalance($user->id);
            if($resp === false){
                $bet->delete();
                return response()->json(['type'=>'error','message'=>'Insufficient Balance!!!']);
            }
            $user = User::find($user->id);

            if($casino->type != 'sky') {
                $backBets = CasinoBet::where("user_id", $user->id)->where('bet_side', "BACK")->where('casino_id', $casino->id)->where('deleted', 0)->whereNull('winner')->orderBy('id', 'DESC')->get();
                $layBets = CasinoBet::where("user_id", $user->id)->where('bet_side', "LAY")->where('casino_id', $casino->id)->where('deleted', 0)->whereNull('winner')->orderBy('id', 'DESC')->get();

                $betHtml = view('frontend.ajax.casino-bet-list', compact('backBets', 'layBets'))->render();
            }else{
                $betHtml = '';
            }

            return response()->json(['type'=>'success','message'=>'Bet Placed Successfully.','data'=>[
                'exposer' => number_format($user->exposer, 2, '.', ''),
                'available_balance' => number_format($user->available_balance, 2, '.', ''),
                'casino_exposer' => $casinoExposer['ODDS'],
                'bet_html' => $betHtml
            ]]);
        }

        return response()->json(['type'=>'success','message'=>'Unable to place bet, please try after some time.']);

    }

    public function declareCasinoBetWinner(Request $request){

        $user = User::find(auth()->guard('web')->user()->id);
        if ($user->remaining_balance <= 0) {
            return response()->json(['type'=>'error','message'=>'Insufficient Balance!']);
        }

        $last10Results = json_decode($request->result,true);

        $casino = Casino::where("id",$request->casino_id)->first();
        if(empty($casino)){
            return response()->json(['status'=>false,'message'=>'Casino not found']);
        }
        if(empty($request->round_id) || $request->round_id<=0){
            return ['status'=>false,'message'=>'Invalid round id'];
        }

        CasinoBet::where("round_id",$request->round_id)->update([
            'cards' => json_encode($request->cards)
        ]);

        $resp = $this->updateCasinoWinner($last10Results, $casino, $user);

        $betHtml = '';
        if($casino->type != 'sky') {
            $backBets = CasinoBet::where("user_id", $user->id)->where('bet_side', "BACK")->where('casino_id', $casino->id)->where('deleted', 0)->whereNull('winner')->orderBy('id', 'DESC')->get();
            $layBets = CasinoBet::where("user_id", $user->id)->where('bet_side', "LAY")->where('casino_id', $casino->id)->where('deleted', 0)->whereNull('winner')->orderBy('id', 'DESC')->get();

            $betHtml = view('frontend.ajax.casino-bet-list', compact('backBets', 'layBets'))->render();
        }

        $user = User::find(auth()->guard('web')->user()->id);

        $available_balance = $user->available_balance;

        return response()->json(['type'=>'success','message'=>'Result declare successfully','data'=>['bet_html'=>$betHtml,'available_balance'=>$available_balance]]);
    }

    public function matchBets($gameId){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }


        $user = User::where("id",auth()->guard('web')->user()->id)->first();

        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        $query = Bet::where('result_declare', 0)->where('deleted', 0)->where('user_id', $user->id);

        if($gameId!='all') {
            $match = SportMatch::where(['game_id' => $gameId])->first();
            if(empty($match)){
                return response()->json(['type'=>'error','message'=>'Invalid Match']);
            }
            $query->where('match_id', $match->id);
        }

        $backBets = $query->where('bet_side','BACK')->orderBy('id', 'Desc')->get();

        $query = Bet::where('result_declare', 0)->where('deleted', 0)->where('user_id', $user->id);

        if($gameId!='all') {
            $match = SportMatch::where(['game_id' => $gameId])->first();
            if(empty($match)){
                return response()->json(['type'=>'error','message'=>'Invalid Match']);
            }
            $query->where('match_id', $match->id);
        }
        $layBets = $query->where('bet_side','LAY')->orderBy('id', 'Desc')->get();

        $matches = SportMatch::whereIn('id', function ($query) use ($user) {
            $query->select('match_id')
                ->from(with(new Bet())->getTable())
                ->where('user_id', $user->id)->where("deleted",0)->where('result_declare',0);
        })->select("id","name",'game_id','match_date')->get();


        $html = view('frontend.ajax.detail-bet-list',compact('backBets','layBets','matches','gameId'))->render();

        return response()->json(['type'=>'success','message'=>'Bets','data'=>['html'=>$html]]);
    }

    public function userBets(Request $request){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = User::where("id",auth()->guard('web')->user()->id)->first();

        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        $query = Bet::where('deleted', 0)->with('match')->where('user_id', $user->id);

        $type = 'bet';
        if($request->has('result_declare')) {
            $query->where('result_declare', $request->result_declare);

            if($request->result_declare == 1){
                $type = 'bet-history';
            }
        }

        if($request->has('report_from') && !empty($request->report_from)){
            if($request->report_from == 'today') {
                $fromDate = date('Y-m-d');
                $toDate = date('Y-m-d', strtotime('+1 days'));
            }else if($request->report_from == 'yesterday') {
                $fromDate = date('Y-m-d', strtotime('-1 days'));
                $toDate = date('Y-m-d', strtotime('+1 days'));
            }else if($request->report_from == 'getPL'){
                $fromDate = date('Y-m-d',strtotime($request->from_date));
                $toDate = date('Y-m-d',strtotime($request->to_date));
            }

            $query->where('created_at',">=", $fromDate)->where('created_at','<=',$toDate);
        }

        $bets = $query->orderBy('id', 'Desc')->paginate(15);

        $html = view('profile-bet-list',compact('bets','type'))->render();

        return response()->json(['type'=>'success','message'=>'Bets','data'=>['html'=>$html]]);
    }

    public function userCasinoBets(Request $request){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = User::where("id",auth()->guard('web')->user()->id)->first();

        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        $query = AwcCasinoBet::where('deleted', 0)->where('user_id', $user->id);

        $type = 'bet';
        if($request->has('result_declare')) {
            $query->where('result_declare', $request->result_declare);

            if($request->result_declare == 1){
                $type = 'bet-history';
            }
        }

        if($request->has('report_from') && !empty($request->report_from)){
            if($request->report_from == 'today') {
                $fromDate = date('Y-m-d');
                $toDate = date('Y-m-d', strtotime('+1 days'));
            }else if($request->report_from == 'yesterday') {
                $fromDate = date('Y-m-d', strtotime('-1 days'));
                $toDate = date('Y-m-d', strtotime('+1 days'));
            }else if($request->report_from == 'getPL'){
                $fromDate = date('Y-m-d',strtotime($request->from_date));
                $toDate = date('Y-m-d',strtotime($request->to_date));
            }

            $query->where('created_at',">=", $fromDate)->where('created_at','<=',$toDate);
        }

        $bets = $query->orderBy('id', 'Desc')->paginate(15);

        $html = view('profile-bet-list',compact('bets','type'))->render();

        return response()->json(['type'=>'success','message'=>'Bets','data'=>['html'=>$html]]);
    }

    public function matchesSearch(Request $request){
        $query = SportMatch::query();
        if($request->has('q')){
            $search = $request->query('q');
            $query->where(function ($q) use ($search) {
                $q->where("name", 'like', '%' . $search . '%')->orWhere("match_date", 'like', '%' . $search . '%')->orWhere("game_id", 'like', '%' . $search . '%')->orWhere("market_id", 'like', '%' . $search . '%');
            });
        }

        $matches = $query->whereNull('winner')->take(20)->orderBy('match_date','ASC')->get();

        return response()->json(['type'=>'success','message'=>'Results','data'=>$matches]);
    }

    public function userBetReport($id){
        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $user = User::where("id",auth()->guard('web')->user()->id)->first();

        if ($user->status != 'active') {
            return response()->json(['type'=>'error','message'=>'Your account is block, Contact to your upline']);
        }

        return $this->getBetReportHtml($user->id, $id);
    }
    public function fancyUserCalculation(Request $request){

        if (!auth()->guard('web')->check()) {
            return response()->json(['type'=>'error','message'=>'Login Required']);
        }

        $html = $this->getSessionCalculation(auth()->guard('web')->user()->id,$request->selection_sid,$request->match_id);

        return response()->json(['type'=>'success','message'=>'Data','data'=>['html'=>$html['html']]]);
    }
}
