use reqwest::Client;
use std::env;
use std::error::Error;
use tokio;
use std::time::Instant;  // For measuring response time

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: rust_load_tester <url1> <url2> ...");
        std::process::exit(1);
    }

    let urls: Vec<String> = args[1..].to_vec();
    let client = Client::new();

    let mut handles = vec![];
    let mut successful_requests = 0;
    let mut failed_requests = 0;

    for url in urls {
        let client = client.clone();
        let url = url.clone();

        // Start the timer for response time
        let handle = tokio::spawn(async move {
            let start = Instant::now();  // Start time
            let response = client.get(&url).send().await;
            let elapsed_time = start.elapsed().as_millis();  // Measure time taken

            match response {
                Ok(res) => {
                    let status = res.status();
                    let body = res.text().await.unwrap_or_else(|_| "No body".to_string());  // Get the response body

                    // Print formatted output for successful response
                    println!("✅ Response from URL: {}", url);
                    println!("   ➡ {}", body);
                    println!("⏱️  Response time: {} ms\n", elapsed_time);

                    (true, status.as_u16())
                }
                Err(err) => {
                    eprintln!("Error fetching {}: {}", url, err);
                    (false, 0)
                }
            }
        });

        handles.push(handle);
    }

    for handle in handles {
        if let Ok((success, _)) = handle.await {
            if success {
                successful_requests += 1;
            } else {
                failed_requests += 1;
            }
        }
    }

    // Print summary
    println!("📊 Total successful requests: {}", successful_requests);
    println!("🔴 Total failed requests: {}", failed_requests);

    Ok(())
}
