import os, warnings

#quick warnings silencing (potentially tensorflow info outputs)
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

#imports
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

#optimizers

# alt_opt_adam = keras.optimizers.Adam(learning_rate=1e-3)
# alt_opt_sgd = keras.optimizers.SGD(learning_rate=1e-2, momentum=0.9, nesterov=True)
tf.get_logger().setLevel("ERROR")

#training routine for the neural network taking in quantified state of some given client
def sspec_nn_train(
	X   :   np.ndarray, 
	y   :   np.ndarray, 
	optimizer   :   str     =   "adamw", 
	epochs      :   int     =   100, 
	batch_size  :   int     =   16, 
	lr          :   float   =   None, 
	verbose     :   int     =   1, 
	GPU         :   bool    =   False
):
	'''
	INFO
	----
	Routine for neural network training
	This is ready to go with only X y param entry.

	RETURNS
	-------
	the tensorflow NN model
	'''

	#force computation device to cut instantiation time
	dev = "/GPU:0" if GPU else "/CPU:0"

	#run w device
	with tf.device(dev):
		
		#NN architecture
		model = keras.Sequential([
			layers.Input(shape=(X.shape[1],)),
			layers.Dense(64, activation="relu"),
			layers.Dropout(0.2),
			layers.Dense(16, activation='relu'),
			layers.Dense(6, activation="softmax")
		])

		#optimizer selection, wanted this parameterized incase we wanted to test others like SGD
		if optimizer == "adam":
			opt = keras.optimizers.Adam(learning_rate=(1e-3 if lr is None else lr))
		elif optimizer == "sgd":
			opt = keras.optimizers.SGD(learning_rate=1e-2, momentum=0.9, nesterov=True)
		else:
			opt = keras.optimizers.AdamW(learning_rate=(1e-3 if lr is None else lr), weight_decay=1e-4)

		#standard compile and split, only need accuracy and loss output
		model.compile(optimizer=opt, loss=keras.losses.SparseCategoricalCrossentropy(), metrics=["accuracy"])
		model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=verbose)
	
	#EO routine
	return model

#simple function for model inference
def sspec_nn_predict(
	model, 
	X	:	np.ndarray, 
	GPU	:	bool	=	False
):
	#force device do avoid any instantiation time on TFs end
	dev = "/GPU:0" if GPU else "/CPU:0"
	
	#run w device
	with tf.device(dev):

		#tf evaluation call
		p = model.predict(X, verbose=0)

	#returns proba and output, may change this?
	return p, p.argmax(axis=1)