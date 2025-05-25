# server.py
from flask import Flask, request, jsonify
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load your model (similar to your working console version)
def load_model():
    model_path = "apricot_disease_model.pth"
    state_dict = torch.load(model_path, map_location=torch.device('cpu'))
    
    from torchvision.models import resnet18
    model = resnet18(weights=None)
    
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(256, 4)
    )
    
    model.load_state_dict(state_dict)
    model.eval()
    return model

model = load_model()
class_names = ['Brown_Rot', 'Healthy', 'Powdery_Mildew', 'Shot_Hole']  # Update with your actual classes

def transform_image(image_bytes):
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    image = Image.open(io.BytesIO(image_bytes))
    return transform(image).unsqueeze(0)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        img_bytes = file.read()
        tensor = transform_image(img_bytes)
        
        with torch.no_grad():
            outputs = model(tensor)
            _, predicted = torch.max(outputs, 1)
            confidence = torch.nn.functional.softmax(outputs, dim=1)[0] * 100
        
        return jsonify({
            'class': class_names[predicted.item()],
            'confidence': round(confidence[predicted.item()].item(), 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)