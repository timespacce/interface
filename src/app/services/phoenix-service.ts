import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs/Observable"
import 'rxjs/add/operator/map'

@Injectable()
export class PhoenixService {

    prefix_local: string = 'http://localhost:4000'
    prefix_remote: string = 'https://tranquil-sands-58720.herokuapp.com/'

    compile: string = '/Compile'

    constructor(private http: HttpClient) { }

    getGraph(body): Observable<any> {
        let headers: HttpHeaders = new HttpHeaders().set('Content-Type', 'application/json')
        //let par: HttpParams = new HttpParams().set('expression', expression)
        return this.http.post(this.prefix_local + this.compile, body, { headers: headers })
    }
}