using UnityEngine;

public class BallController : MonoBehaviour
{
    public float moveSpeed = 5f;
    private Material originalMaterial;
    private Color originalColor;

    private void Start()
    {
        // Save the original material and color to revert to later
        originalMaterial = GetComponent<Renderer>().material;
        originalColor = originalMaterial.color;

        // Drop the ball at the initial angle
        DropBall();
    }

    private void Update()
    {
        // You can keep your movement controls here if needed
    }

    private void DropBall()
    {
        // Calculate the initial velocity based on the drop angle
        Vector3 initialVelocity = Quaternion.Euler(-45f, 0f, 0f) * Vector3.forward;

        // Apply the initial velocity to the Rigidbody
        GetComponent<Rigidbody>().velocity = initialVelocity * moveSpeed;
    }

    private void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Wall"))
        {
            // Change color based on the name of the wall
            ChangeColorBasedOnWallName(collision.gameObject.name);

            // Optionally, reset color after a delay (e.g., 1 second)

        }
    }

    private void ChangeColorBasedOnWallName(string wallName)
    {
        // Change color based on the name of the wall
        switch (wallName)
        {
            case "Wall1": // Change this to the name of your first wall
                GetComponent<Renderer>().material.color = Color.blue;
                break;
            case "Wall2": // Change this to the name of your second wall
                GetComponent<Renderer>().material.color = Color.green;
                break;
            case "Floor": // Change this to the name of your third wall
                GetComponent<Renderer>().material.color = Color.red;
                break;
                // Add more cases for additional walls
        }
    }

    private void ResetColor()
    {
        // Reset to the original color
        GetComponent<Renderer>().material.color = originalColor;
    }
}
