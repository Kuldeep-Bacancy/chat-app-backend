class ApiResponse {
  constructor(statusCode, message, data=[], errors=[]){
    this.statusCode = statusCode,
    this.message = message,
    this.data = data
    this.errors = errors
  }
}

export default ApiResponse