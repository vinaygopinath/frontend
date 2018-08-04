import { AnyAction } from "redux";
import { ActionsObservable, combineEpics, Epic, ofType, StateObservable } from "redux-observable";
import { Observable, of } from 'rxjs';
import { AjaxCreationMethod, AjaxError } from "rxjs/internal/observable/dom/AjaxObservable";
import { catchError, map, mergeMap } from 'rxjs/operators';

import { ApiConstants } from "../../constants/api";
import { IState } from "../../interfaces/IState";
import { ILoginResponse } from "../../interfaces/responses/ILoginResponse";
import { UserActions } from "./UserActions";
import { IUserActions, UserActionType, UserLoginError } from "./UserTypes";

export class UserEpics {
  public static ALL = combineEpics(
    UserEpics.loginUser as Epic<AnyAction, AnyAction, IState, AjaxCreationMethod>
  );

  /**
   * Makes a network request to the login endpoint, initiating the login success action
   * or the login failed action appropriately.
   */
  public static loginUser(action$: ActionsObservable<IUserActions>, state$: StateObservable<IState>, { getJSON }: AjaxCreationMethod): Observable<IUserActions> {
    return action$.pipe(
      ofType(UserActionType.LOGIN),
      mergeMap(() => getJSON<ILoginResponse>(ApiConstants.LOGIN_URL).pipe(
        map(
          loginResponse => UserActions.loginSuccess(loginResponse)
        )
      )),
      catchError((err: AjaxError) => {
        return of(UserActions.loginFailed(err.status === 401 ? UserLoginError.INVALID_USERNAME_OR_PASSWORD : UserLoginError.SERVER_ERROR));
      })
    );
  }
}